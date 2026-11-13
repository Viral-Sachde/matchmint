import Link from "next/link";
import { KIND_LABEL, NEED_LABEL } from "@/lib/constants";
import { date, range } from "@/lib/format";
import type { Post } from "@/lib/types";
import { Verified } from "./Verified";

type CardPost = Pick<Post, "kind" | "need" | "category" | "title" | "summary" | "amountMin" | "amountMax" | "deadline" | "location"> & {
  id?: string; owner: { orgName: string; verified?: boolean }; proposalCount?: number;
};

export function PostCard({ post }: { post: CardPost }) {
  const isReq = post.kind === "REQUEST";
  const body = (
    <>
      <div className="card-top">
        <span className={`tag ${isReq ? "req" : "off"}`}>{KIND_LABEL[post.kind]} · {NEED_LABEL[post.need]}</span>
        <span className="mono dim cat">{post.category}</span>
      </div>
      <span className="go" aria-hidden="true">→</span>
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
      <div className="card-foot">
        <span className="org">{post.owner.orgName}{post.owner.verified && <Verified />}</span>
        <b className="r">{range(post.amountMin, post.amountMax)}</b>
        <span className="mono dim">{post.location || "Anywhere"}</span>
        <span className="mono dim r">{post.deadline ? `Closes ${date(post.deadline)}` : "Rolling"}{post.proposalCount ? ` · ${post.proposalCount} in` : ""}</span>
      </div>
    </>
  );
  const cls = `card ${isReq ? "" : "off"}`;
  return post.id ? <Link href={`/posts/${post.id}`} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}
