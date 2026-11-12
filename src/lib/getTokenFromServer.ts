import { headers } from "next/headers";
import { auth } from "./auth";

export const getTokenFromServer = async (): Promise<string | undefined> => {
  try {
    const jwtToken = await auth.api.getToken({
      headers: await headers(),
    });
    return jwtToken?.token;
  } catch {
    return undefined;
  }
};
