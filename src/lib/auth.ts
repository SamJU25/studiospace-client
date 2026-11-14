import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studiospace";
const dbName = process.env.MONGODB_DB_NAME || "studiospace";

const globalForMongo = globalThis as unknown as {
  __studioSpaceMongoClient?: MongoClient;
};

const client =
  globalForMongo.__studioSpaceMongoClient ?? new MongoClient(mongoUri);
if (process.env.NODE_ENV !== "production") {
  globalForMongo.__studioSpaceMongoClient = client;
}

const db = client.db(dbName);

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
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
