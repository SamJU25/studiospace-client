"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { syncServerCookie } from "@/lib/api";

export function AuthCookieSync() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      syncServerCookie();
    }
  }, [userId]);

  return null;
}
