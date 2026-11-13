"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Matched, ResponseItem } from "@/components/Responses";
import { Gate } from "@/components/Gate";
import { SplitButton } from "@/components/SplitButton";
import { Verified } from "@/components/Verified";
import { api } from "@/lib/api";
import { KIND_LABEL, NEED_LABEL, ORG_LABEL } from "@/lib/constants";
import { count, date, inr, noMoney, range } from "@/lib/format";
import type { PostDetail, Proposal } from "@/lib/types";

export function PostView({ id }: { id: string }) {
  const { user, ready } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [responses, setResponses] = useState<Proposal[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const p = await api<PostDetail>(`/posts/${id}`);
      setPost(p);
      if (p.isOwner) setResponses(await api<Proposal[]>(`/posts/${id}/proposals`));
    } catch (e) { setError((e as Error).message); }
  }, [id]);

  useEffect(() => { if (ready) load(); }, [ready, user?.id, load]);

  if (error) return (
    <section className="pd-hero on-dark t-slate" style={{ minHeight: "70svh", alignContent: "end" }}>
      <h1>{error}</h1>
      <div><SplitButton href="/explore" variant="light">Back to the board</SplitButton></div>
    </section>
  );
  if (!post) return <div className="pd-hero t-slate" style={{ minHeight: "60svh" }} aria-busy="true" />;

  const isReq = post.kind === "REQUEST";
  const closed = post.status === "CLOSED";

  return (
    <>
      <section className={`pd-hero on-dark ${isReq ? "t-pine" : "t-plum"}`}>
        <div style={{ display: "grid", gap: 18 }}>
          <span className="mono"><Link href="/explore">Board</Link> / {KIND_LABEL[post.kind]} / {NEED_LABEL[post.need]} / {post.category}{closed ? " / Closed" : ""}</span>
          <h1>{post.title}</h1>
        </div>
        <div className="pd-meta">
          <div><span className="mono dim">{noMoney(post.amountMin, post.amountMax) ? "Money" : isReq ? "Looking for" : "On the table"}</span><b>{range(post.amountMin, post.amountMax)}</b></div>
          <div><span className="mono dim">{isReq ? "Posted by" : "Backed by"}</span><b>{post.owner.orgName}{post.owner.verified && <Verified />}</b></div>
          <div><span className="mono dim">Where</span><b>{post.location || "Anywhere"}</b></div>
          <div><span className="mono dim">Closes</span><b>{date(post.deadline)}</b></div>
        </div>
      </section>

      <div className="pd pad">
        <div className="pd-main">
          <p className="pd-lede">{post.summary}</p>
          {post.gated && <Gate flat title="Sign in to read the full post" next={`/posts/${post.id}`} />}
          {post.description && (
            <div className="pd-text">{post.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</div>
          )}
          {post.perks.length > 0 && (
            <section>
              <h2 className="mono dim" style={{ marginBottom: 12 }}>{isReq ? "What a backer gets" : "What is provided"}</h2>
              <ol className="perks">{post.perks.map((p, i) => <li key={i}><span className="mono dim">{String(i + 1).padStart(2, "0")}</span>{p}</li>)}</ol>
            </section>
          )}
          {(post.audienceSize > 0 || post.audienceNote) && (
            <section>
              <h2 className="mono dim" style={{ marginBottom: 12 }}>{isReq ? "Audience" : "Who should apply"}</h2>
              <p className="pd-lede">{post.audienceSize > 0 && <>{count(post.audienceSize)} people. </>}{post.audienceNote}</p>
            </section>
          )}
          <section className="who">
            <i>{post.owner.orgName[0]}</i>
            <div>
              <b style={{ fontWeight: 500, fontSize: 16 }}>{post.owner.orgName}{post.owner.verified && <Verified label />}</b>
              <p className="mono dim" style={{ margin: "4px 0 8px" }}>{ORG_LABEL[post.owner.orgType]}{post.owner.location ? ` · ${post.owner.location}` : ""}</p>
              {post.owner.bio && <p className="body">{post.owner.bio}</p>}
            </div>
          </section>
        </div>

        <aside className="side">
          {post.isOwner
            ? <OwnerPanel post={post} responses={responses} onChange={load} />
            : <RespondPanel post={post} signedIn={!!user} waiting={user?.memberStatus === "PENDING"} onChange={load} />}
          <div className="rule-box">
            <span className="mono">The payer decides</span>
            <p>{isReq
              ? "Backers reply to this post with proposals. A proposal is the backer saying yes. The poster accepts one and both sides get contact details."
              : `${post.owner.orgName} is paying, so they accept or decline each proposal. Accepting unlocks contact details for both sides.`}</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function OwnerPanel({ post, responses, onChange }: { post: PostDetail; responses: Proposal[] | null; onChange: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const closed = post.status === "CLOSED";
  const pending = responses?.filter((r) => r.status === "PENDING").length ?? 0;
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <span className="mono dim">Your post</span>
          <h2>Proposals{responses ? ` (${responses.length})` : ""}</h2>
        </div>
        <span className={`pill ${post.status}`}>{post.status.toLowerCase()}</span>
      </div>
      {responses === null ? <div className="skel" style={{ height: 80 }} />
        : responses.length === 0 ? <p className="body">Nothing yet. Responses will appear here the moment they arrive.</p>
        : <div>{responses.map((r) => <ResponseItem key={r.id} r={r} postKind={post.kind} onChange={onChange} />)}</div>}
      {pending > 0 && <p className="mono dim">{pending} waiting for your decision</p>}
      <div className="resp-acts">
        <Link href={`/posts/new?edit=${post.id}`} className="box">Edit</Link>
        <button
        className="box line"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try { await api(`/posts/${post.id}/status`, { method: "PATCH", body: { status: closed ? "OPEN" : "CLOSED" } }); onChange(); }
          finally { setBusy(false); }
        }}
      >{closed ? "Reopen" : "Close"}</button>
        {confirmDelete ? (
          <>
            <button className="box" disabled={busy} onClick={async () => { setBusy(true); try { await api(`/posts/${post.id}`, { method: "DELETE" }); router.replace("/dashboard?tab=posts"); } finally { setBusy(false); } }}>Yes, delete it</button>
            <button className="box line" onClick={() => setConfirmDelete(false)}>Keep</button>
          </>
        ) : <button className="box line danger" onClick={() => setConfirmDelete(true)}>Delete</button>}
      </div>
      {confirmDelete && <p className="mono" style={{ color: "var(--crimson)" }}>This removes the post and every proposal on it. It cannot be undone.</p>}
    </div>
  );
}

function RespondPanel({ post, signedIn, waiting, onChange }: { post: PostDetail; signedIn: boolean; waiting?: boolean; onChange: () => void }) {
  const isReq = post.kind === "REQUEST";
  const mine = post.myProposal;
  const [amount, setAmount] = useState(String(post.amountMin || post.amountMax || ""));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const noun = "proposal";

  if (post.status === "CLOSED" && mine?.status !== "ACCEPTED") {
    return <div className="panel"><h2>This post is closed</h2><p className="body">It is no longer taking responses.</p><Link href="/explore" className="box line">Back to the board</Link></div>;
  }

  if (mine && mine.status !== "DECLINED" && mine.status !== "WITHDRAWN") {
    return (
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div><span className="mono dim">Your {noun}</span><h2>{mine.amount ? inr(mine.amount) : "No money involved"}</h2></div>
          <span className={`pill ${mine.status}`}>{mine.status.toLowerCase()}</span>
        </div>
        <p className="body">{mine.message}</p>
        {mine.status === "ACCEPTED"
          ? <Matched name={post.owner.orgName} email={mine.ownerEmail} />
          : (
            <>
              <p className="mono dim">Waiting for {post.owner.orgName} to decide</p>
              <button
                className="box line"
                disabled={busy}
                onClick={async () => {
                  setBusy(true); setError("");
                  try { await api(`/proposals/${mine.id}`, { method: "PATCH", body: { action: "withdraw" } }); onChange(); }
                  catch (e) { setError((e as Error).message); }
                  finally { setBusy(false); }
                }}
              >Withdraw</button>
            </>
          )}
        {error && <p className="note err" role="alert">{error}</p>}
      </div>
    );
  }

  if (waiting) {
    return <div className="panel"><h2>Almost there</h2><p className="body">Your request to join your organisation is waiting for an owner to approve it. You can send proposals as soon as it is approved.</p><Link href="/dashboard" className="box line">Go to dashboard</Link></div>;
  }

  if (!signedIn) {
    const next = encodeURIComponent(`/posts/${post.id}`);
    return (
      <div className="panel">
        <h2>{isReq ? "Offer to back this" : "Ask for this backing"}</h2>
        <p className="body">Sign in to send a proposal. It is free and takes a minute.</p>
        <SplitButton href={`/signup?as=${isReq ? "backer" : "seeker"}&next=${next}`} className="block">Create an account</SplitButton>
        <Link href={`/login?next=${next}`} className="box line">I already have one</Link>
      </div>
    );
  }

  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError("");
        try { await api(`/posts/${post.id}/proposals`, { method: "POST", body: { amount: noMoney(post.amountMin, post.amountMax) ? 0 : Number(amount || 0), message } }); setMessage(""); onChange(); }
        catch (err) { setError((err as Error).message); }
        finally { setBusy(false); }
      }}
    >
      <div>
        <span className="mono dim">{isReq ? "You would be the payer" : `${post.owner.orgName} is the payer`}</span>
        <h2>{isReq ? "Offer to back this" : "Ask for this backing"}</h2>
      </div>
      {mine && <p className="note">Your earlier {noun} was {mine.status.toLowerCase()}. You can send a new one.</p>}
      <div className="f">
        {!noMoney(post.amountMin, post.amountMax) && (
          <label className="fld"><span>{isReq ? "Amount you would commit (₹)" : "Amount you are asking for (₹)"}</span>
            <input required type="number" min={0} step={1000} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <small>{isReq ? "Looking for" : "On the table"}: {range(post.amountMin, post.amountMax)}</small>
          </label>
        )}
        <label className="fld"><span>Message</span>
          <textarea required minLength={20} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isReq ? "What you would like to back, and anything you need in return." : "Who you are and why you are a good fit."} />
        </label>
      </div>
      {error && <p className="note err" role="alert">{error}</p>}
      <SplitButton type="submit" className="block" disabled={busy}>{busy ? "Sending" : "Send proposal"}</SplitButton>
    </form>
  );
}
