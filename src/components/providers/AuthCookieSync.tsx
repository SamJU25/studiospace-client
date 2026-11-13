"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { syncServerCookie } from "@/lib/api";

export function AuthCookieSync() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      syncServerCookie();
    }
  }, [session?.user?.id]);

  return null;
}
