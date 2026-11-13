"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ORG_LABEL } from "@/lib/constants";
import type { OrgType } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import { SplitButton } from "./SplitButton";

function safeNext(raw: string | null, fallback: string) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready, login, signup } = useAuth();
  const backer = params.get("as") === "backer";
  const next = safeNext(params.get("next"), mode === "signup" ? "/posts/new" : "/dashboard");
  const [v, setV] = useState({ name: "", orgName: "", orgType: (backer ? "BRAND" : "NGO") as OrgType, email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // if the organisation is already registered, this person joins it instead of creating a second copy
  const [existing, setExisting] = useState<{ name: string; type: OrgType } | null>(null);
  useEffect(() => {
    if (mode !== "signup" || v.orgName.trim().length < 2) { setExisting(null); return; }
    const t = setTimeout(() => {
      api<{ exists: boolean; name?: string; type?: OrgType }>(`/orgs/check?name=${encodeURIComponent(v.orgName)}`, { auth: false })
        .then((r) => setExisting(r.exists ? { name: r.name!, type: r.type! } : null))
        .catch(() => setExisting(null));
    }, 350);
    return () => clearTimeout(t);
  }, [v.orgName, mode]);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });

  // someone still waiting to be approved has nothing to do yet except see that status
  useEffect(() => { if (ready && user) router.replace(user.memberStatus === "PENDING" ? "/dashboard" : next); }, [ready, user, next, router]);

  const qs = params.toString() ? `?${params}` : "";

  return (
    <section className="auth">
      <div className={`auth-art on-dark ${mode === "signup" ? (backer ? "t-plum" : "t-pine") : "t-pine"}`}>
        <span className="mono" style={{ position: "relative" }}>{mode === "signup" ? (backer ? "For backers" : "For seekers") : "Welcome back"}</span>
        <Image src={mode === "login" ? "/img/community.jpg" : backer ? "/img/signing.jpg" : "/img/volunteer.jpg"} alt="" fill sizes="(max-width: 860px) 100vw, 50vw" priority className="auth-img" />
        <p className="d2">
          {mode === "login" ? <>Pick up where you <em>left off.</em></>
            : backer ? <>You pay, so <em>you decide</em> who gets backed.</>
            : <>One clear post. <em>Backers come to you.</em></>}
        </p>
      </div>
      <div className="auth-form">
        <h1>{mode === "login" ? "Sign in" : "Create your account"}</h1>
        <form
          className="f"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true); setError("");
            try {
              if (mode === "login") await login(v.email, v.password);
              else {
                await signup(existing ? { ...v, orgType: undefined } : v);
                return; // the effect above sends them on once the account is loaded
              }
              router.replace(next);
            } catch (err) { setError((err as Error).message); setBusy(false); }
          }}
        >
          {mode === "signup" && (
            <>
              <label className="fld"><span>Your name</span><input required minLength={2} value={v.name} onChange={set("name")} autoComplete="name" /></label>
              <div className="f-row">
                <label className="fld"><span>Organisation or project</span><input required minLength={2} value={v.orgName} onChange={set("orgName")} autoComplete="organization" /></label>
                {existing ? (
                  <label className="fld"><span>Registered as</span><input value={ORG_LABEL[existing.type]} disabled readOnly /></label>
                ) : (
                  <label className="fld"><span>You are</span>
                    <select value={v.orgType} onChange={set("orgType")}>
                      {(Object.keys(ORG_LABEL) as OrgType[]).map((k) => <option key={k} value={k}>{ORG_LABEL[k]}</option>)}
                    </select>
                  </label>
                )}
              </div>
              {existing && (
                <p className="note"><b>{existing.name} is already on MatchMint.</b> You will join it as a team member. With a work email on the same domain you get in straight away; otherwise an owner approves your request.</p>
              )}
            </>
          )}
          <label className="fld"><span>Email</span><input required type="email" value={v.email} onChange={set("email")} autoComplete="email" /></label>
          <label className="fld"><span>Password</span>
            <input required type="password" minLength={mode === "signup" ? 8 : 1} value={v.password} onChange={set("password")} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            {mode === "signup" && <small>At least 8 characters.</small>}
          </label>
          {error && <p className="note err" role="alert">{error}</p>}
          <div><SplitButton type="submit" disabled={busy}>{busy ? "One moment" : mode === "login" ? "Sign in" : existing ? "Join organisation" : "Create account"}</SplitButton></div>
        </form>
        <p className="alt">
          {mode === "login"
            ? <>New here? <Link href={`/signup${qs}`}>Create an account</Link></>
            : <>Already have an account? <Link href={`/login${qs}`}>Sign in</Link></>}
        </p>
        {mode === "login" && process.env.NODE_ENV !== "production" && (
          <p className="note">Demo accounts: <b>asha@greenroots.demo</b> (seeker) and <b>ananya@kestrel.demo</b> (backer). The shared password is the DEMO_PASSWORD value in <code>apps/api/.env</code>.</p>
        )}
      </div>
    </section>
  );
}

/** Sends signed-out visitors to the sign-in screen and brings them back afterwards. */
export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();
  useEffect(() => {
    if (auth.ready && !auth.user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, [auth.ready, auth.user, router]);
  return auth;
}
