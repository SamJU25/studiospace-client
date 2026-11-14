import { headers } from "next/headers";
import { getTokenFromHeaders } from "./auth";

export const getTokenFromServer = async (): Promise<string | undefined> => {
  try {
    const jwtToken = await getTokenFromHeaders(await headers());
    return jwtToken?.token;
  } catch {
    return undefined;
  }
};
