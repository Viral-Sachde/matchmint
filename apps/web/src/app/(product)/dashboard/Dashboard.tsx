"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthScreen";
import { DecisionButtons, Matched, PostLink } from "@/components/Responses";
import { SplitButton } from "@/components/SplitButton";
import { Verified } from "@/components/Verified";
import { api } from "@/lib/api";
import { KIND_LABEL, NEED_LABEL, ORG_LABEL } from "@/lib/constants";
import { ago, inr, range } from "@/lib/format";
import type { Member, Org, OrgType, Post, Proposal, User } from "@/lib/types";

const TABS = [
  ["overview", "Overview"], ["posts", "Posts"], ["proposals", "Proposals"], ["organisation", "Organisation"],
  ["verification", "Verification"], ["team", "Team"], ["account", "Account"],
] as const;
type Tab = (typeof TABS)[number][0];

const money = (n: number) => (n ? inr(n) : "No money");

export function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready, logout, refresh } = useRequireAuth();
  const tab = (TABS.some(([t]) => t === params.get("tab")) ? params.get("tab") : "overview") as Tab;
  const go = (t: Tab) => router.replace(t === "overview" ? "/dashboard" : `/dashboard?tab=${t}`, { scroll: false });

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [incoming, setIncoming] = useState<Proposal[] | null>(null);
  const [sent, setSent] = useState<Proposal[] | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState("");
  const active = user?.memberStatus === "ACTIVE";

  const load = useCallback(async () => {
    try {
      const [p, i, s, o, m] = await Promise.all([
        api<Post[]>("/posts/mine"), api<Proposal[]>("/proposals/incoming"), api<Proposal[]>("/proposals/sent"), api<Org>("/org"), api<Member[]>("/org/members"),
      ]);
      setPosts(p); setIncoming(i); setSent(s); setOrg(o); setMembers(m); setError("");
    } catch (e) { setError((e as Error).message); }
  }, []);

  useEffect(() => { if (user && active) load(); }, [user?.id, active, load]); // eslint-disable-line react-hooks/exhaustive-deps

  // a full page load to the home page, so the signed-out redirect to the sign-in screen cannot get in first
  const signOut = () => { logout(); window.location.assign("/"); };

  if (!ready || !user) return <div className="pad p-head"><p className="mono dim">Loading</p></div>;

  // someone who asked to join an organisation and has not been approved yet
  if (!active) {
    return (
      <div className="pad">
        <div className="p-head"><div><span className="mono dim">Dashboard</span><h1>Almost there</h1></div><button className="box line" onClick={signOut}>Sign out</button></div>
        <div className="dash-wait">
          <h2 className="d3">Your request to join {user.orgName} is waiting for approval</h2>
          <p className="body">{user.orgName} is already on MatchMint, so you were added to it instead of creating a second copy. An owner of the organisation needs to approve you. Ask them to open Dashboard, then Team.</p>
          <div className="resp-acts">
            <button className="box" onClick={() => refresh()}>Check again</button>
            <Link href="/explore" className="box line">Browse the board meanwhile</Link>
          </div>
        </div>
        <AccountSection user={user} onSignOut={signOut} onChanged={refresh} />
      </div>
    );
  }

  const isOwner = user.role === "OWNER";
  const waiting = incoming?.filter((r) => r.status === "PENDING") ?? [];
  const requests = members?.filter((m) => m.memberStatus === "PENDING") ?? [];
  const matches = [...(incoming ?? []), ...(sent ?? [])].filter((r) => r.status === "ACCEPTED");
  const count: Partial<Record<Tab, number>> = { posts: posts?.length, proposals: waiting.length, team: requests.length };

  return (
    <div className="pad">
      <div className="p-head">
        <div>
          <span className="mono dim">Dashboard · {isOwner ? "Owner" : "Team member"}</span>
          <h1 className="dash-title">{user.orgName}{user.verified && <Verified />}</h1>
        </div>
        <div className="resp-acts">
          {user.isAdmin && <Link href="/admin" className="box line">Review verifications</Link>}
          <button className="box line" onClick={signOut}>Sign out</button>
          <SplitButton href="/posts/new">Create a post</SplitButton>
        </div>
      </div>

      <div className="dash">
        <nav className="dash-nav" aria-label="Dashboard sections">
          {TABS.map(([t, label]) => (
            <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => go(t)}>
              {label}{count[t] ? <sup>{count[t]}</sup> : null}
            </button>
          ))}
        </nav>

        <div className="dash-main">
          {error && <p className="note err" role="alert">{error}</p>}
          {posts === null && !error && <div className="skel" style={{ height: 200 }} />}

          {tab === "overview" && posts && org && (
            <>
              <div className="dash-stats">
                <div><b>{waiting.length}</b><span className="mono dim">Waiting for your decision</span></div>
                <div><b>{posts.filter((p) => p.status === "OPEN").length}</b><span className="mono dim">Open posts</span></div>
                <div><b>{sent?.filter((r) => r.status === "PENDING").length ?? 0}</b><span className="mono dim">Sent, awaiting reply</span></div>
                <div><b>{matches.length}</b><span className="mono dim">Matches made</span></div>
              </div>

              <section className="dash-sec">
                <h2>Get set up</h2>
                <div className="setup">
                  <Step done={!!(org.bio && org.location)} title="Complete your organisation profile" body="A description and a location, so people know who they are dealing with." action="Edit profile" onClick={() => go("organisation")} />
                  <Step done={org.verification === "VERIFIED"} pending={org.verification === "PENDING"} title="Get verified" body={org.verification === "PENDING" ? "Your details are with our team." : "Verified organisations get a badge on every post and proposal."} action={org.verification === "VERIFIED" ? "View" : "Start"} onClick={() => go("verification")} />
                  <Step done={posts.length > 0} title="Create your first post" body="Say what you need, or what you want to back." action="Create a post" href="/posts/new" />
                  <Step done={(members?.filter((m) => m.memberStatus === "ACTIVE").length ?? 0) > 1} title="Bring in your team" body="Colleagues who sign up with your organisation's name join it automatically." action="See team" onClick={() => go("team")} />
                </div>
              </section>

              {(waiting.length > 0 || (isOwner && requests.length > 0)) && (
                <section className="dash-sec">
                  <h2>Needs your attention</h2>
                  <div className="tbl">
                    {waiting.slice(0, 4).map((r) => <IncomingRow key={r.id} r={r} onChange={load} />)}
                    {isOwner && requests.map((m) => (
                      <div className="tr" key={m.id}>
                        <div><span className="t">{m.name} wants to join your team</span><span className="sub">{m.email} · asked {ago(m.createdAt)}</span></div>
                        <span /><span><span className="pill PENDING">Pending</span></span>
                        <span className="acts"><button className="box sm" onClick={() => go("team")}>Review</button></span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {matches.length > 0 && (
                <section className="dash-sec">
                  <h2>Your matches</h2>
                  <div className="tbl">
                    {matches.map((r) => {
                      const mine = r.senderId === user.orgId;
                      const other = mine ? r.post?.owner : r.sender;
                      return (
                        <div className="tr" key={r.id}>
                          <div><PostLink id={r.postId}>{other?.orgName}{other?.verified && <Verified />}</PostLink><span className="sub">{r.post?.title}</span></div>
                          <span className="resp-amt">{money(r.amount)}</span><span /><span />
                          <Matched name={other?.name ?? other?.orgName ?? "them"} email={other?.email} />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          {tab === "posts" && posts && <PostsSection posts={posts} onChange={load} />}
          {tab === "proposals" && incoming && sent && <ProposalsSection incoming={incoming} sent={sent} onChange={load} />}
          {tab === "organisation" && org && <OrgSection org={org} canEdit={isOwner} onSaved={async () => { await load(); await refresh(); }} />}
          {tab === "verification" && org && <VerificationSection org={org} canEdit={isOwner} onSaved={async () => { await load(); await refresh(); }} goProfile={() => go("organisation")} />}
          {tab === "team" && members && <TeamSection members={members} me={user} onChange={load} />}
          {tab === "account" && <AccountSection user={user} onSignOut={signOut} onChanged={refresh} />}
        </div>
      </div>
    </div>
  );
}

function Step({ done, pending, title, body, action, onClick, href }: { done: boolean; pending?: boolean; title: string; body: string; action: string; onClick?: () => void; href?: string }) {
  return (
    <div className={`setup-step ${done ? "done" : ""}`}>
      <span className="setup-mark" aria-hidden="true">{done ? "✓" : pending ? "…" : ""}</span>
      <div><b>{title}</b><span>{body}</span></div>
      {href ? <Link href={href} className="box sm line">{action}</Link> : <button className="box sm line" onClick={onClick}>{action}</button>}
    </div>
  );
}

function IncomingRow({ r, onChange }: { r: Proposal; onChange: () => void }) {
  return (
    <div className="tr">
      <div>
        <PostLink id={r.postId}>{r.sender.orgName}{r.sender.verified && <Verified />}</PostLink>
        <span className="sub">Sent a proposal on “{r.post?.title}” · {ago(r.createdAt)}</span>
      </div>
      <span className="resp-amt">{money(r.amount)}</span>
      <span><span className={`pill ${r.status}`}>{r.status.toLowerCase()}</span></span>
      <span className="acts">{r.status === "PENDING" && <DecisionButtons id={r.id} postKind={r.post?.kind ?? "OFFER"} onDone={onChange} />}</span>
      <p className="msg">{r.message}</p>
      {r.status === "ACCEPTED" && <Matched name={r.sender.name ?? r.sender.orgName} email={r.sender.email} />}
    </div>
  );
}

function PostsSection({ posts, onChange }: { posts: Post[]; onChange: () => void }) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id); setError("");
    try { await fn(); setConfirm(null); onChange(); } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  };
  if (!posts.length) return <Empty title="No posts yet" body="Tell the board what you need, or what you want to back." />;
  return (
    <section className="dash-sec">
      <div className="dash-sec-head"><h2>Your organisation&rsquo;s posts</h2><Link href="/posts/new" className="box sm">New post</Link></div>
      {error && <p className="note err" role="alert">{error}</p>}
      <div className="tbl">
        {posts.map((p) => (
          <div className="tr tr-post" key={p.id}>
            <div>
              <PostLink id={p.id}>{p.title}</PostLink>
              <span className="sub">{KIND_LABEL[p.kind]} · {NEED_LABEL[p.need]} · {p.category} · posted {ago(p.createdAt)} · {p.proposalCount ?? 0} proposals</span>
            </div>
            <span className="resp-amt">{range(p.amountMin, p.amountMax)}</span>
            <span><span className={`pill ${p.status}`}>{p.status.toLowerCase()}</span></span>
            <span className="acts">
              {confirm === p.id ? (
                <>
                  <span className="mono" style={{ color: "var(--crimson)" }}>Delete with its proposals?</span>
                  <button className="box sm" disabled={busy === p.id} onClick={() => run(p.id, () => api(`/posts/${p.id}`, { method: "DELETE" }))}>Yes, delete</button>
                  <button className="box sm line" onClick={() => setConfirm(null)}>Keep</button>
                </>
              ) : (
                <>
                  <Link href={`/posts/${p.id}`} className="box sm line">View</Link>
                  <Link href={`/posts/new?edit=${p.id}`} className="box sm line">Edit</Link>
                  <button className="box sm line" disabled={busy === p.id} onClick={() => run(p.id, () => api(`/posts/${p.id}/status`, { method: "PATCH", body: { status: p.status === "OPEN" ? "CLOSED" : "OPEN" } }))}>{p.status === "OPEN" ? "Close" : "Reopen"}</button>
                  <button className="box sm line danger" onClick={() => setConfirm(p.id)}>Delete</button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProposalsSection({ incoming, sent, onChange }: { incoming: Proposal[]; sent: Proposal[]; onChange: () => void }) {
  const [side, setSide] = useState<"in" | "out">("in");
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <section className="dash-sec">
      <div className="tabs" role="group" aria-label="Proposals">
        <button aria-pressed={side === "in"} onClick={() => setSide("in")}>Received<sup>{incoming.length}</sup></button>
        <button aria-pressed={side === "out"} onClick={() => setSide("out")}>Sent<sup>{sent.length}</sup></button>
      </div>
      {side === "in" && (incoming.length ? <div className="tbl">{incoming.map((r) => <IncomingRow key={r.id} r={r} onChange={onChange} />)}</div>
        : <Empty title="No proposals yet" body="When someone sends a proposal on one of your posts, it lands here for you to decide." />)}
      {side === "out" && (sent.length ? (
        <div className="tbl">
          {sent.map((r) => (
            <div className="tr" key={r.id}>
              <div>
                <PostLink id={r.postId}>{r.post?.title ?? "Post"}</PostLink>
                <span className="sub">Your proposal to {r.post?.owner.orgName} · {ago(r.createdAt)}</span>
              </div>
              <span className="resp-amt">{money(r.amount)}</span>
              <span><span className={`pill ${r.status}`}>{r.status.toLowerCase()}</span></span>
              <span className="acts">
                {r.status === "PENDING" && <button className="box sm line" disabled={busy === r.id} onClick={async () => { setBusy(r.id); try { await api(`/proposals/${r.id}`, { method: "PATCH", body: { action: "withdraw" } }); onChange(); } finally { setBusy(null); } }}>Withdraw</button>}
              </span>
              <p className="msg">{r.message}</p>
              {r.status === "ACCEPTED" && <Matched name={r.post?.owner.name ?? r.post?.owner.orgName ?? "them"} email={r.post?.owner.email} />}
            </div>
          ))}
        </div>
      ) : <Empty title="Nothing sent yet" body="Find someone seeking backing, or someone offering it, and send a proposal." cta={{ label: "Explore the board", href: "/explore" }} />)}
    </section>
  );
}

function OrgSection({ org, canEdit, onSaved }: { org: Org; canEdit: boolean; onSaved: () => Promise<void> }) {
  const [v, setV] = useState({ name: org.name, type: org.type, bio: org.bio, location: org.location, website: org.website });
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: e.target.value }); setState("idle"); };
  return (
    <section className="dash-sec">
      <h2>Organisation profile</h2>
      <p className="body">This is what people see on your posts and proposals.{!canEdit && " Only an owner can change it."}</p>
      <form className="f dash-form" onSubmit={async (e) => {
        e.preventDefault(); setState("busy"); setError("");
        try { await api("/org", { method: "PATCH", body: v }); await onSaved(); setState("saved"); } catch (err) { setError((err as Error).message); setState("idle"); }
      }}>
        <fieldset disabled={!canEdit} className="f" style={{ border: 0 }}>
          <div className="f-row">
            <label className="fld"><span>Name</span><input required minLength={2} maxLength={120} value={v.name} onChange={set("name")} />{org.verification === "VERIFIED" && <small>Changing a verified name removes the badge until we check it again.</small>}</label>
            <label className="fld"><span>Kind of organisation</span><select value={v.type} onChange={set("type")}>{(Object.keys(ORG_LABEL) as OrgType[]).map((k) => <option key={k} value={k}>{ORG_LABEL[k]}</option>)}</select></label>
          </div>
          <label className="fld"><span>What you do</span><textarea maxLength={600} value={v.bio} onChange={set("bio")} placeholder="Two or three sentences about your work." /><small>{v.bio.length} of 600</small></label>
          <div className="f-row">
            <label className="fld"><span>Location</span><input maxLength={120} value={v.location} onChange={set("location")} placeholder="City or region" /></label>
            <label className="fld"><span>Website</span><input maxLength={200} value={v.website} onChange={set("website")} placeholder="https://" /></label>
          </div>
        </fieldset>
        {error && <p className="note err" role="alert">{error}</p>}
        {state === "saved" && <p className="note ok" role="status">Saved.</p>}
        {canEdit && <div><button className="box" disabled={state === "busy"}>{state === "busy" ? "Saving" : "Save profile"}</button></div>}
      </form>
    </section>
  );
}

const REG_TYPES = ["Company registration (CIN)", "NGO registration (80G, 12A or CSR-1)", "GST number", "University or institute letter", "Trust or society registration", "Other"];

function VerificationSection({ org, canEdit, onSaved, goProfile }: { org: Org; canEdit: boolean; onSaved: () => Promise<void>; goProfile: () => void }) {
  const [v, setV] = useState({ regType: org.regType || REG_TYPES[0], regNumber: org.regNumber, docUrl: org.docUrl, note: org.verificationNote });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const profileDone = !!(org.bio && org.location);
  const status = org.verification;
  return (
    <section className="dash-sec">
      <h2>Verification</h2>
      <div className={`vstatus vs-${status}`}>
        <b>{status === "VERIFIED" ? <>Verified <Verified /></> : status === "PENDING" ? "Under review" : status === "REJECTED" ? "Not approved" : "Not verified yet"}</b>
        <span>{status === "VERIFIED" ? "Your badge shows on every post and proposal."
          : status === "PENDING" ? "Our team is checking your details. This usually takes one or two working days."
          : status === "REJECTED" ? (org.reviewNote || "We could not confirm the details you sent. Correct them and send again.")
          : "Send your registration details and our team will check them. Verified organisations get a badge and are trusted faster."}</span>
      </div>
      {status !== "VERIFIED" && status !== "PENDING" && (
        !canEdit ? <p className="note">Only an owner of the organisation can ask for verification.</p>
        : !profileDone ? <p className="note">Complete your organisation profile first: add a description and a location. <button className="linkish" onClick={goProfile}>Edit profile</button></p>
        : (
          <form className="f dash-form" onSubmit={async (e) => {
            e.preventDefault(); setBusy(true); setError("");
            try { await api("/org/verification", { method: "POST", body: v }); await onSaved(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
          }}>
            <div className="f-row">
              <label className="fld"><span>Proof of registration</span><select value={v.regType} onChange={set("regType")}>{REG_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="fld"><span>Registration number</span><input required minLength={2} maxLength={80} value={v.regNumber} onChange={set("regNumber")} /></label>
            </div>
            <label className="fld"><span>Link to a document (optional)</span><input maxLength={300} value={v.docUrl} onChange={set("docUrl")} placeholder="A shared link to your certificate" /><small>For example a Drive link. File upload is not available yet.</small></label>
            <label className="fld"><span>Anything we should know (optional)</span><textarea maxLength={600} value={v.note} onChange={set("note")} style={{ minHeight: 72 }} /></label>
            {error && <p className="note err" role="alert">{error}</p>}
            <div><button className="box" disabled={busy}>{busy ? "Sending" : status === "REJECTED" ? "Send again" : "Send for verification"}</button></div>
          </form>
        )
      )}
      {status === "PENDING" && <p className="mono dim">Sent: {org.regType}, {org.regNumber}</p>}
    </section>
  );
}

function TeamSection({ members, me, onChange }: { members: Member[]; me: User; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const isOwner = me.role === "OWNER";
  const act = async (id: string, action: string) => {
    setBusy(id); setError("");
    try { await api(`/org/members/${id}`, { method: "PATCH", body: { action } }); onChange(); } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  };
  const pending = members.filter((m) => m.memberStatus === "PENDING");
  const team = members.filter((m) => m.memberStatus === "ACTIVE");
  return (
    <section className="dash-sec">
      <h2>Team</h2>
      <p className="body">Anyone who signs up with the name “{me.orgName}” joins this organisation instead of creating a second one. A work email on the same domain as an existing member is let in straight away. Everyone else waits here for an owner.</p>
      {error && <p className="note err" role="alert">{error}</p>}
      {pending.length > 0 && (
        <>
          <h3 className="dash-h3">Waiting to join</h3>
          <div className="tbl">
            {pending.map((m) => (
              <div className="tr" key={m.id}>
                <div><span className="t">{m.name}</span><span className="sub">{m.email} · asked {ago(m.createdAt)}</span></div>
                <span /><span><span className="pill PENDING">Pending</span></span>
                <span className="acts">{isOwner ? (<><button className="box sm" disabled={busy === m.id} onClick={() => act(m.id, "approve")}>Approve</button><button className="box sm line" disabled={busy === m.id} onClick={() => act(m.id, "remove")}>Decline</button></>) : <span className="mono dim">An owner decides</span>}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <h3 className="dash-h3">Members</h3>
      <div className="tbl">
        {team.map((m) => (
          <div className="tr" key={m.id}>
            <div><span className="t">{m.name}{m.id === me.id && " (you)"}</span><span className="sub">{m.email} · joined {ago(m.createdAt)}</span></div>
            <span /><span><span className="pill">{m.role === "OWNER" ? "Owner" : "Member"}</span></span>
            <span className="acts">
              {isOwner && m.id !== me.id && (
                <>
                  <button className="box sm line" disabled={busy === m.id} onClick={() => act(m.id, m.role === "OWNER" ? "make_member" : "make_owner")}>{m.role === "OWNER" ? "Make member" : "Make owner"}</button>
                  <button className="box sm line danger" disabled={busy === m.id} onClick={() => act(m.id, "remove")}>Remove</button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountSection({ user, onSignOut, onChanged }: { user: User; onSignOut: () => void; onChanged: () => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [del, setDel] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [msg, setMsg] = useState<{ where: string; ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState("");
  const run = async (where: string, okText: string, fn: () => Promise<unknown>) => {
    setBusy(where); setMsg(null);
    try { await fn(); setMsg({ where, ok: true, text: okText }); } catch (e) { setMsg({ where, ok: false, text: (e as Error).message }); } finally { setBusy(""); }
  };
  const note = (where: string) => msg?.where === where && <p className={`note ${msg.ok ? "ok" : "err"}`} role="status">{msg.text}</p>;
  return (
    <section className="dash-sec">
      <h2>Account</h2>
      <p className="body">Signed in as {user.email}.</p>

      <h3 className="dash-h3">Your name</h3>
      <form className="f dash-form" onSubmit={(e) => { e.preventDefault(); run("name", "Saved.", async () => { await api("/auth/me", { method: "PATCH", body: { name } }); await onChanged(); }); }}>
        <label className="fld"><span>Name</span><input required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        {note("name")}
        <div><button className="box" disabled={busy === "name"}>Save name</button></div>
      </form>

      <h3 className="dash-h3">Change password</h3>
      <form className="f dash-form" onSubmit={(e) => { e.preventDefault(); run("pw", "Password changed.", async () => { await api("/auth/password", { method: "POST", body: pw }); setPw({ current: "", next: "" }); }); }}>
        <div className="f-row">
          <label className="fld"><span>Current password</span><input required type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
          <label className="fld"><span>New password</span><input required type="password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /><small>At least 8 characters.</small></label>
        </div>
        {note("pw")}
        <div><button className="box" disabled={busy === "pw"}>Change password</button></div>
      </form>

      <h3 className="dash-h3">Sign out</h3>
      <div><button className="box line" onClick={onSignOut}>Sign out of MatchMint</button></div>

      <h3 className="dash-h3" style={{ color: "var(--crimson)" }}>Delete account</h3>
      <p className="body">This removes your account for good. If you are the last person in {user.orgName}, the organisation, its posts and its proposals are deleted too.</p>
      {!showDelete ? <div><button className="box line danger" onClick={() => setShowDelete(true)}>Delete my account</button></div> : (
        <form className="f dash-form" onSubmit={(e) => { e.preventDefault(); run("del", "", async () => { await api("/auth/me", { method: "DELETE", body: { password: del } }); onSignOut(); }); }}>
          <label className="fld"><span>Type your password to confirm</span><input required type="password" value={del} onChange={(e) => setDel(e.target.value)} autoComplete="current-password" /></label>
          {note("del")}
          <div className="resp-acts"><button className="box danger-solid" disabled={busy === "del"}>Delete for good</button><button type="button" className="box line" onClick={() => { setShowDelete(false); setDel(""); }}>Cancel</button></div>
        </form>
      )}
    </section>
  );
}

function Empty({ title, body, cta = { label: "Create a post", href: "/posts/new" } }: { title: string; body: string; cta?: { label: string; href: string } }) {
  return (
    <div className="empty" style={{ paddingLeft: 0, borderBottom: 0 }}>
      <h2 className="d3">{title}</h2>
      <p className="body">{body}</p>
      <SplitButton href={cta.href}>{cta.label}</SplitButton>
    </div>
  );
}
