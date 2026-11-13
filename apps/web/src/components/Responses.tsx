"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { ORG_LABEL } from "@/lib/constants";
import { ago, inr } from "@/lib/format";
import type { PostKind, Proposal } from "@/lib/types";
import { Verified } from "./Verified";

/** Accept, decline or withdraw. Asks for a second click before a decision that cannot be undone. */
export function DecisionButtons({ id, postKind, onDone }: { id: string; postKind: PostKind; onDone: () => void }) {
  const [confirm, setConfirm] = useState<"accept" | "decline" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const act = async (action: "accept" | "decline") => {
    setBusy(true); setError("");
    try { await api(`/proposals/${id}`, { method: "PATCH", body: { action } }); onDone(); }
    catch (e) { setError((e as Error).message); setBusy(false); setConfirm(null); }
  };
  const yes = "Accept";
  void postKind;
  if (confirm) {
    return (
      <span className="resp-acts">
        <span className="mono dim">{confirm === "accept" ? "Match and share contact details?" : "Decline for good?"}</span>
        <button className="box sm" disabled={busy} onClick={() => act(confirm)}>{busy ? "Saving" : "Yes"}</button>
        <button className="box sm line" disabled={busy} onClick={() => setConfirm(null)}>Back</button>
      </span>
    );
  }
  return (
    <span className="resp-acts">
      <button className="box sm" onClick={() => setConfirm("accept")}>{yes}</button>
      <button className="box sm line" onClick={() => setConfirm("decline")}>Decline</button>
      {error && <span className="mono" style={{ color: "var(--crimson)" }} role="alert">{error}</span>}
    </span>
  );
}

export function Matched({ name, email }: { name: string; email?: string }) {
  return (
    <p className="matched">
      Matched with {name}.{" "}
      {email ? <>Write to <a href={`mailto:${email}`}>{email}</a> to take it forward.</> : "Their contact details are now available."}
    </p>
  );
}

/** One response as the post owner sees it. */
export function ResponseItem({ r, postKind, onChange }: { r: Proposal; postKind: PostKind; onChange: () => void }) {
  return (
    <article className="resp">
      <div className="resp-top">
        <div>
          <b>{r.sender.orgName}{r.sender.verified && <Verified />}</b>
          <span className="mono dim">{ORG_LABEL[r.sender.orgType]} · {r.sender.location || "No location"} · {ago(r.createdAt)}</span>
        </div>
        <span className="resp-amt">{r.amount ? inr(r.amount) : "No money"}</span>
      </div>
      <p className="msg">{r.message}</p>
      {r.status === "PENDING" ? <DecisionButtons id={r.id} postKind={postKind} onDone={onChange} />
        : r.status === "ACCEPTED" ? <Matched name={r.sender.name ?? r.sender.orgName} email={r.sender.email} />
        : <span className={`pill ${r.status}`}>{r.status.toLowerCase()}</span>}
    </article>
  );
}

export function PostLink({ id, children }: { id: string; children: React.ReactNode }) {
  return <Link href={`/posts/${id}`} className="t">{children}</Link>;
}
