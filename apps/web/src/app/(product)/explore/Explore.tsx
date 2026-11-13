"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { SplitButton } from "@/components/SplitButton";
import { useAuth } from "@/components/AuthProvider";
import { Gate } from "@/components/Gate";
import { apiList } from "@/lib/api";
import { CATEGORIES, NEED_LABEL } from "@/lib/constants";
import type { Need, Post } from "@/lib/types";

const KINDS = [
  { v: "", label: "Everything" },
  { v: "REQUEST", label: "Seeking backing" },
  { v: "OFFER", label: "Offering backing" },
];

export function Explore() {
  const router = useRouter();
  const params = useSearchParams();
  const kind = params.get("kind") ?? "";
  const category = params.get("category") ?? "";
  const need = params.get("need") ?? "";
  const sort = params.get("sort") ?? "";
  const [q, setQ] = useState(params.get("q") ?? "");
  const { user, ready } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/explore${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  // debounce the search box into the URL
  useEffect(() => {
    const t = setTimeout(() => { if ((params.get("q") ?? "") !== q.trim()) set("q", q.trim()); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (need) p.set("need", need);
    if (sort) p.set("sort", sort);
    const term = params.get("q"); if (term) p.set("q", term);
    return p.toString();
  }, [category, need, sort, params]);

  useEffect(() => {
    let live = true;
    setError("");
    if (!ready) return;
    apiList<Post>(`/posts?${query}`)
      .then((r) => { if (live) { setPosts(r.rows); setTotal(r.total); } })
      .catch((e) => live && (setError(e.message), setPosts([])));
    return () => { live = false; };
  }, [query, ready, user?.id]);

  // signed-out visitors get a preview; the rest of the board is behind sign-in
  const gated = !user && posts !== null && total > posts.length;
  const GATE_NEXT = "/explore";

  const shown = posts?.filter((p) => !kind || p.kind === kind) ?? null;
  const n = (k: string) => posts?.filter((p) => !k || p.kind === k).length ?? 0;
  const filtered = Boolean(kind || category || need || params.get("q"));

  return (
    <>
      <div className="p-head pad">
        <div>
          <span className="mono dim">The board</span>
          <h1>Explore</h1>
          <p className="body">Every post is one of two kinds.</p>
          <p className="legend"><span className="tag req">Seeking</span> someone needs funding, a sponsor or a partner.</p>
          <p className="legend"><span className="tag off">Offering</span> someone has a budget or support to give.</p>
        </div>
        <SplitButton href="/posts/new">Create a post</SplitButton>
      </div>

      <div className="bar">
        <div className="tabs" role="group" aria-label="Kind of post">
          {KINDS.map((k) => (
            <button key={k.v} aria-pressed={kind === k.v} onClick={() => set("kind", k.v)}>{k.label}{posts && !gated && <sup>{n(k.v)}</sup>}</button>
          ))}
        </div>
        <select aria-label="Category" value={category} onChange={(e) => set("category", e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Kind of support" value={need} onChange={(e) => set("need", e.target.value)}>
          <option value="">Any support</option>
          {(Object.keys(NEED_LABEL) as Need[]).map((k) => <option key={k} value={k}>{NEED_LABEL[k]}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => set("sort", e.target.value)}>
          <option value="">Newest first</option>
          <option value="amount">Largest amount</option>
          <option value="deadline">Closing soonest</option>
        </select>
        <input type="search" aria-label="Search" placeholder="Search title, place or organisation" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="count mono dim">{shown ? (gated ? `Preview: ${shown.length} of ${total}` : `${shown.length} shown`) : "Loading"}</span>
      </div>

      {error && <p className="note err" style={{ margin: "20px var(--g)" }} role="alert">{error}</p>}

      {shown === null ? (
        <div className="cards">{Array.from({ length: 6 }, (_, i) => <div key={i} className="card skel" />)}</div>
      ) : shown.length ? (
        <>
          <div className="cards">{shown.map((p) => <PostCard key={p.id} post={p} />)}</div>
          {gated && (
            <div className="gate">
              <div className="gate-fade cards" aria-hidden="true">{shown.slice(0, 3).map((p) => <PostCard key={p.id} post={{ ...p, id: undefined }} />)}</div>
              <Gate title={`Sign in to see all ${total} posts`} next={GATE_NEXT} />
            </div>
          )}
        </>
      ) : !error && (
        <div className="empty">
          <h2 className="d3">Nothing matches yet</h2>
          <p className="body">{filtered ? "Try removing a filter, or be the first to post in this space." : "No posts are open at the moment. Be the first."}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {filtered && <button className="box line" onClick={() => { setQ(""); router.replace("/explore", { scroll: false }); }}>Clear filters</button>}
            <SplitButton href="/posts/new">Create a post</SplitButton>
          </div>
        </div>
      )}
    </>
  );
}
