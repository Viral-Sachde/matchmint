"use client";

import { useEffect, useMemo, useState } from "react";
import { apiList } from "@/lib/api";
import { NEED_LABEL } from "@/lib/constants";
import type { Need, Post } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { Gate } from "./Gate";
import { PostCard } from "./PostCard";
import { SplitButton } from "./SplitButton";

/** The board, narrowed to one category, with its own filters. */
export function CategoryBoard({ category, plural }: { category: string; plural: string }) {
  const { user, ready } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("");
  const [need, setNeed] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    let live = true;
    const q = new URLSearchParams({ category, limit: "60" });
    if (need) q.set("need", need);
    if (sort) q.set("sort", sort);
    if (!ready) return;
    apiList<Post>(`/posts?${q}`)
      .then((r) => { if (live) { setPosts(r.rows); setTotal(r.total); } })
      .catch((e) => live && (setError((e as Error).message), setPosts([])));
    return () => { live = false; };
  }, [category, need, sort, ready, user?.id]);

  const gated = !user && posts !== null && total > posts.length;
  const GATE_NEXT = typeof window !== "undefined" ? window.location.pathname : "/explore";

  const shown = useMemo(() => posts?.filter((p) => !kind || p.kind === kind) ?? null, [posts, kind]);
  const n = (k: string) => posts?.filter((p) => !k || p.kind === k).length ?? 0;

  return (
    <div className="cboard">
      <div className="bar">
        <div className="tabs" role="group" aria-label="Kind of post">
          {[["", "Everything"], ["REQUEST", `${plural} seeking`], ["OFFER", `Offers for ${plural.toLowerCase()}`]].map(([v, label]) => (
            <button key={v} aria-pressed={kind === v} onClick={() => setKind(v)}>{label}{posts && <sup>{n(v)}</sup>}</button>
          ))}
        </div>
        <select aria-label="Kind of support" value={need} onChange={(e) => setNeed(e.target.value)}>
          <option value="">Any support</option>
          {(Object.keys(NEED_LABEL) as Need[]).map((k) => <option key={k} value={k}>{NEED_LABEL[k]}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Newest first</option>
          <option value="amount">Largest amount</option>
          <option value="deadline">Closing soonest</option>
        </select>
        <span className="count mono dim">{shown ? `${shown.length} shown` : "Loading"}</span>
      </div>
      {error && <p className="note err" role="alert" style={{ marginTop: 16 }}>{error}</p>}
      {shown === null ? (
        <div className="cards">{Array.from({ length: 3 }, (_, i) => <div key={i} className="card skel" />)}</div>
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
          <h3 className="d3">Nothing open here yet</h3>
          <p className="body">Be the first. A clear post in this category gets seen by everyone browsing it.</p>
          <SplitButton href="/posts/new">Create a post</SplitButton>
        </div>
      )}
    </div>
  );
}
