"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, setToken } from "@/lib/api";

/** Local development shortcut: /demo?as=seeker, backer or admin opens the app already signed in. */
function DemoSignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  useEffect(() => {
    const want = params.get("as");
    const as = want === "backer" || want === "admin" ? want : "seeker";
    api<{ token: string }>("/auth/demo", { method: "POST", body: { as }, auth: false })
      .then(({ token }) => { setToken(token); window.location.replace(as === "admin" ? "/admin" : "/dashboard"); })
      .catch((e) => setError((e as Error).message));
  }, [params, router]);
  return <div className="pad p-head"><p className="body">{error || "Signing you in to the demo account"}</p></div>;
}

export default function Page() {
  return <Suspense><DemoSignIn /></Suspense>;
}
