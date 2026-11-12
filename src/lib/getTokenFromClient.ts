import { authClient } from "./auth-client";

export const getTokenFromClient = async (): Promise<string | undefined> => {
  try {
    const { data } = await authClient.token();
    return data?.token;
  } catch {
    return undefined;
  }
};
