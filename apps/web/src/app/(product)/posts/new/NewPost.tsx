"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthScreen";
import { PostCard } from "@/components/PostCard";
import { SplitButton } from "@/components/SplitButton";
import { api } from "@/lib/api";
import { CATEGORIES, NEED_LABEL } from "@/lib/constants";
import type { Need, PostDetail, PostKind } from "@/lib/types";

export function NewPost() {
  const router = useRouter();
  const { user, ready } = useRequireAuth();
  const [kind, setKind] = useState<PostKind>("REQUEST");
  const [v, setV] = useState({
    need: "FUNDING" as Need, category: "NGO", title: "", summary: "", description: "", amountMin: "", amountMax: "",
    location: "", deadline: "", audienceSize: "", audienceNote: "", perks: "",
  });
  const [busy, setBusy] = useState(false);
  const [moneyFree, setMoneyFree] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);

  // ?category=... preselects a category. ?edit=<id> loads an existing post to change it.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("category");
    if (c && (CATEGORIES as readonly string[]).includes(c)) setV((cur) => ({ ...cur, category: c }));
    const id = q.get("edit");
    if (!id) return;
    api<PostDetail>(`/posts/${id}`)
      .then((p) => {
        if (!p.isOwner) { setError("Only the organisation that posted this can edit it."); return; }
        setEditId(id); setKind(p.kind); setMoneyFree(!p.amountMin && !p.amountMax);
        setV({
          need: p.need, category: p.category, title: p.title, summary: p.summary, description: p.description,
          amountMin: p.amountMin ? String(p.amountMin) : "", amountMax: p.amountMax ? String(p.amountMax) : "",
          location: p.location, deadline: p.deadline ?? "", audienceSize: p.audienceSize ? String(p.audienceSize) : "",
          audienceNote: p.audienceNote, perks: p.perks.join("\n"),
        });
      })
      .catch((e) => setError((e as Error).message));
  }, []);
  const [error, setError] = useState("");
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const isReq = kind === "REQUEST";
  const perks = v.perks.split("\n").map((s) => s.trim()).filter(Boolean);

  if (!ready || !user) return <div className="pad p-head"><p className="mono dim">Loading</p></div>;
  if (user.memberStatus !== "ACTIVE") {
    return (
      <div className="pad p-head"><div>
        <h1>Almost there</h1>
        <p className="body">Your request to join {user.orgName} is waiting for an owner to approve it. You can post as soon as it is approved.</p>
      </div></div>
    );
  }

  return (
    <>
      <div className="p-head pad">
        <div>
          <span className="mono dim">{editId ? "Your post" : "New post"}</span>
          <h1>{editId ? "Edit post" : "Create a post"}</h1>
          <p className="body">Posting as {user.orgName}. Clear, specific posts get answered fastest.</p>
        </div>
      </div>

      <form
        className="np pad"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const min = moneyFree ? 0 : Number(v.amountMin || 0), max = moneyFree ? 0 : Number(v.amountMax || 0);
          if (max < min) { setError("The maximum amount must be at least the minimum."); return; }
          setBusy(true);
          try {
            const { id } = await api<{ id: string }>(editId ? `/posts/${editId}` : "/posts", {
              method: editId ? "PATCH" : "POST",
              body: {
                kind, need: v.need, category: v.category, title: v.title, summary: v.summary, description: v.description,
                amountMin: min, amountMax: max, location: v.location, deadline: v.deadline || undefined,
                audienceSize: v.audienceSize ? Number(v.audienceSize) : undefined, audienceNote: v.audienceNote, perks,
              },
            });
            router.push(`/posts/${id}`);
          } catch (err) { setError((err as Error).message); setBusy(false); }
        }}
      >
        <div>
          <section className="np-sec">
            <span className="mono dim">01</span>
            <div>
              <h2>Which side are you on?</h2>
              <div className="choice big">
                <button type="button" className="pine" aria-pressed={isReq} onClick={() => setKind("REQUEST")}>
                  <b>I need backing</b><small>A Seeking post. Backers will send you proposals.</small>
                </button>
                <button type="button" className="plum" aria-pressed={!isReq} onClick={() => setKind("OFFER")}>
                  <b>I have backing to give</b><small>An Offering post. Seekers will send you proposals and you choose.</small>
                </button>
              </div>
            </div>
          </section>

          <section className="np-sec">
            <span className="mono dim">02</span>
            <div className="f">
              <h2 style={{ marginBottom: 0 }}>The basics</h2>
              <div className="f-row">
                <label className="fld"><span>{isReq ? "What you need" : "What you are offering"}</span>
                  <select value={v.need} onChange={set("need")}>{(Object.keys(NEED_LABEL) as Need[]).map((k) => <option key={k} value={k}>{NEED_LABEL[k]}</option>)}</select>
                </label>
                <label className="fld"><span>Category</span>
                  <select value={v.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
              </div>
              <label className="fld"><span>Title</span>
                <input required minLength={6} maxLength={110} value={v.title} onChange={set("title")} placeholder={isReq ? "Fund 50,000 native saplings before the monsoon" : "Sponsoring 10 university sports teams this season"} />
              </label>
              <label className="fld"><span>One or two sentences</span>
                <textarea required minLength={20} maxLength={240} value={v.summary} onChange={set("summary")} style={{ minHeight: 72 }} />
                <small>{v.summary.length} of 240. This is what people see on the board.</small>
              </label>
              <label className="fld"><span>The full story (optional)</span>
                <textarea maxLength={4000} value={v.description} onChange={set("description")} style={{ minHeight: 150 }} placeholder={isReq ? "Who you are, what the money or support makes possible, and your track record." : "What you want to back, your criteria, and how you will choose."} />
              </label>
            </div>
          </section>

          <section className="np-sec">
            <span className="mono dim">03</span>
            <div className="f">
              <h2 style={{ marginBottom: 0 }}>{moneyFree ? "Where and by when" : isReq ? "How much, where and by when" : "Budget, reach and deadline"}</h2>
              <label className="check">
                <input type="checkbox" checked={moneyFree} onChange={(e) => setMoneyFree(e.target.checked)} />
                <span>
                  <b>No money involved</b>
                  <small>{isReq ? "You need time, skills, products, space or a partner, not cash." : "You are offering time, skills, products or space, not cash."}</small>
                </span>
              </label>
              {!moneyFree && (
                <div className="f-row">
                  <label className="fld"><span>{isReq ? "Smallest useful amount (₹)" : "Smallest grant (₹)"}</span><input type="number" min={0} step={1000} inputMode="numeric" value={v.amountMin} onChange={set("amountMin")} placeholder="0" /></label>
                  <label className="fld"><span>{isReq ? "Full amount (₹)" : "Largest grant (₹)"}</span><input required min={1} type="number" step={1000} inputMode="numeric" value={v.amountMax} onChange={set("amountMax")} /></label>
                </div>
              )}
              <div className="f-row">
                <label className="fld"><span>Location</span><input maxLength={120} value={v.location} onChange={set("location")} placeholder="City, region or Remote" /></label>
                <label className="fld"><span>Deadline (optional)</span><input type="date" value={v.deadline} onChange={set("deadline")} /></label>
              </div>
              {isReq && (
                <div className="f-row">
                  <label className="fld"><span>Audience size (optional)</span><input type="number" min={0} inputMode="numeric" value={v.audienceSize} onChange={set("audienceSize")} /></label>
                  <label className="fld"><span>Who they are</span><input maxLength={200} value={v.audienceNote} onChange={set("audienceNote")} placeholder="Students aged 18 to 24, pan-India" /></label>
                </div>
              )}
              {!isReq && (
                <label className="fld"><span>Who should apply</span><input maxLength={200} value={v.audienceNote} onChange={set("audienceNote")} placeholder="Registered non-profits working in education" /></label>
              )}
              <label className="fld"><span>{isReq ? "What a backer gets in return" : "What you provide"}</span>
                <textarea value={v.perks} onChange={set("perks")} placeholder={isReq ? "Logo on the main stage\nA speaking slot\nQuarterly impact report" : "Cash grant\nMentors from our team\nProduct for the season"} />
                <small>One per line, up to eight.</small>
              </label>
            </div>
          </section>

          {error && <p className="note err" role="alert" style={{ marginBottom: 20 }}>{error}</p>}
          <SplitButton type="submit" disabled={busy}>{busy ? "Saving" : editId ? "Save changes" : "Publish post"}</SplitButton>
        </div>

        <aside className="np-prev">
          <span className="mono dim">Preview on the board</span>
          <PostCard post={{
            kind, need: v.need, category: v.category, title: v.title || "Your title appears here", summary: v.summary || "Your one or two sentences appear here.",
            amountMin: moneyFree ? 0 : Number(v.amountMin || 0), amountMax: moneyFree ? 0 : Number(v.amountMax || 0), deadline: v.deadline || null, location: v.location, owner: { orgName: user.orgName },
          }} />
          <div className="rule-box">
            <span className="mono">The payer decides</span>
            <p>{isReq ? "Backers will send you proposals. A proposal means they have decided to back you. You accept the one you want and contact details unlock." : "Seekers will send you proposals. You are paying, so you accept or decline each one."}</p>
          </div>
        </aside>
      </form>
    </>
  );
}
