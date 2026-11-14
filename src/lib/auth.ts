import { betterAuth } from "better-auth";
import { MongoClient, type Db, type MongoClientOptions } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { attachDatabasePool } from "@vercel/functions";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri && process.env.NODE_ENV === "production") {
  throw new Error("MONGODB_URI must be configured in production.");
}
const resolvedMongoUri = mongoUri || "mongodb://127.0.0.1:27017/studiospace";
const dbName = process.env.MONGODB_DB_NAME || "studiospace";

const MONGO_CLIENT_OPTIONS: MongoClientOptions = {
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 10_000,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 20_000,
};

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const trustedOrigins = Array.from(
  new Set(
    [
      ...(process.env.NODE_ENV !== "production"
        ? [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
          ]
        : []),
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      process.env.VERCEL_BRANCH_URL
        ? `https://${process.env.VERCEL_BRANCH_URL}`
        : undefined,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined,
    ].filter((origin): origin is string => Boolean(origin))
  )
);

function buildBetterAuth(client: MongoClient, db: Db) {
  return betterAuth({
    appName: "StudioSpace",
    trustedOrigins,
    database: mongodbAdapter(db, {
      client,
    }),
    emailAndPassword: {
      enabled: true,
    },
    ...(googleEnabled
      ? {
          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID as string,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
          },
        }
      : {}),
    plugins: [jwt()],
    session: {
      cookieCache: {
        enabled: true,
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  });
}

type StudioSpaceAuth = ReturnType<typeof buildBetterAuth>;

interface AuthRuntimeState {
  client: MongoClient;
  db: Db;
  auth: StudioSpaceAuth;
  connectPromise: Promise<MongoClient> | null;
  topologyClosed: boolean;
}

const globalForAuth = globalThis as unknown as {
  __studioSpaceAuthState?: AuthRuntimeState;
};

function isClientTopologyClosed(client: MongoClient): boolean {
  const internalTopology = (
    client as unknown as {
      topology?: {
        isDestroyed?: () => boolean;
        s?: { state?: string };
      };
    }
  ).topology;

  return (
    Boolean(internalTopology?.isDestroyed?.()) ||
    internalTopology?.s?.state === "closed"
  );
}

function isAuthStateDead(state: AuthRuntimeState | undefined): boolean {
  return !state || state.topologyClosed || isClientTopologyClosed(state.client);
}

function isTransientMongoError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "MongoTopologyClosedError" ||
    error.name === "MongoServerSelectionError" ||
    error.name === "MongoNetworkError" ||
    error.message.includes("Topology is closed")
  );
}

function createAuthState(): AuthRuntimeState {
  const client = new MongoClient(resolvedMongoUri, MONGO_CLIENT_OPTIONS);
  attachDatabasePool(client);

  const db = client.db(dbName);
  const state: AuthRuntimeState = {
    client,
    db,
    auth: buildBetterAuth(client, db),
    connectPromise: null,
    topologyClosed: false,
  };

  client.once("topologyClosed", () => {
    state.topologyClosed = true;
    state.connectPromise = null;
    if (globalForAuth.__studioSpaceAuthState === state) {
      globalForAuth.__studioSpaceAuthState = undefined;
    }
  });

  globalForAuth.__studioSpaceAuthState = state;
  return state;
}

function resetAuthState(state?: AuthRuntimeState): void {
  const target = state ?? globalForAuth.__studioSpaceAuthState;
  if (!target) return;
  target.topologyClosed = true;
  target.connectPromise = null;
  if (globalForAuth.__studioSpaceAuthState === target) {
    globalForAuth.__studioSpaceAuthState = undefined;
  }
  target.client.close().catch(() => {});
}

async function ensureAuthState(): Promise<AuthRuntimeState> {
  let state = globalForAuth.__studioSpaceAuthState;
  if (isAuthStateDead(state)) {
    if (state) resetAuthState(state);
    state = createAuthState();
  }

  const activeState = state!;
  if (!activeState.connectPromise) {
    activeState.connectPromise = activeState.client.connect().catch((err) => {
      resetAuthState(activeState);
      throw err;
    });
  }

  try {
    await activeState.connectPromise;
  } catch (err) {
    resetAuthState(activeState);
    if (!isTransientMongoError(err)) {
      throw err;
    }
    const freshState = createAuthState();
    freshState.connectPromise = freshState.client.connect().catch((retryErr) => {
      resetAuthState(freshState);
      throw retryErr;
    });
    await freshState.connectPromise;
    return freshState;
  }

  if (isAuthStateDead(activeState)) {
    resetAuthState(activeState);
    const freshState = createAuthState();
    freshState.connectPromise = freshState.client.connect().catch((retryErr) => {
      resetAuthState(freshState);
      throw retryErr;
    });
    await freshState.connectPromise;
    return freshState;
  }

  return activeState;
}

export async function withAuthRecovery<T>(
  operation: (authInstance: StudioSpaceAuth) => Promise<T>
): Promise<T> {
  const state = await ensureAuthState();
  try {
    return await operation(state.auth);
  } catch (err) {
    if (!isTransientMongoError(err) && !isAuthStateDead(state)) {
      throw err;
    }
    resetAuthState(state);
    const freshState = await ensureAuthState();
    return operation(freshState.auth);
  }
}

export async function handleAuthRequest(request: Request): Promise<Response> {
  const retryRequest = request.clone();
  const state = await ensureAuthState();

  try {
    const response = await state.auth.handler(request);
    if (response.status >= 500) {
      let healthy = !isAuthStateDead(state);
      if (healthy) {
        try {
          await state.db.command({ ping: 1 });
        } catch {
          healthy = false;
        }
      }
      if (!healthy) {
        resetAuthState(state);
        const freshState = await ensureAuthState();
        return freshState.auth.handler(retryRequest);
      }
    }
    return response;
  } catch (err) {
    if (!isTransientMongoError(err) && !isAuthStateDead(state)) {
      throw err;
    }
    resetAuthState(state);
    const freshState = await ensureAuthState();
    return freshState.auth.handler(retryRequest);
  }
}

export async function getSessionFromHeaders(headers: Headers) {
  return withAuthRecovery((authInstance) =>
    authInstance.api.getSession({ headers })
  );
}

export async function getTokenFromHeaders(headers: Headers) {
  return withAuthRecovery((authInstance) =>
    authInstance.api.getToken({ headers })
  );
}
