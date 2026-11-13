import Image from "next/image";
import Link from "next/link";
import { CATEGORY_PAGES, SUPPORT } from "@/lib/categories";
import { CATEGORY_INFO, KIND_LABEL, NEED_LABEL } from "@/lib/constants";
import { range } from "@/lib/format";
import { load } from "@/lib/load";
import type { Post, PostKind } from "@/lib/types";
import { Reveal, RevealText } from "./Reveal";
import { SplitButton } from "./SplitButton";

export function SectionHead({ label, title, action }: { label: string; title: Parameters<typeof RevealText>[0]["parts"]; action?: { label: string; href: string } }) {
  return (
    <div className="head">
      <div>
        <Reveal as="span" className="mono dim">{label}</Reveal>
        <RevealText as="h2" className="d2" parts={title} />
      </div>
      {action && <Reveal><SplitButton href={action.href}>{action.label}</SplitButton></Reveal>}
    </div>
  );
}

/** Photo cards, one per kind of organisation, each linking to its own page. */
export function CategoryGrid({ only }: { only?: number }) {
  const list = only ? CATEGORY_PAGES.slice(0, only) : CATEGORY_PAGES;
  return (
    <div className="catgrid">
      {list.map((c, i) => (
        <Reveal key={c.slug} delay={(i % 5) * 0.06}>
          <Link href={`/for/${c.slug}`} className="catcard">
            <Image src={CATEGORY_INFO[c.key].img} alt="" fill sizes="(max-width: 700px) 50vw, 20vw" />
            <span className={`catcard-in ${i % 2 ? "plum" : "pine"}`}>
              <b>{CATEGORY_INFO[c.key].plural}</b>
              <small>Looking for {CATEGORY_INFO[c.key].seeks}</small>
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** The four kinds of support, told from the seeker's or the backer's side. */
export function SupportTypes({ side }: { side: "seeker" | "backer" }) {
  return (
    <div className={`types types-${side}`}>
      {SUPPORT.map((s, i) => (
        <Reveal key={s.need} delay={i * 0.07} className="type">
          <span className="mono">{String(i + 1).padStart(2, "0")}</span>
          <h3>{s.title}</h3>
          <p>{side === "seeker" ? s.seeker : s.backer}</p>
          <Link href={`/explore?need=${s.need}&kind=${side === "seeker" ? "OFFER" : "REQUEST"}`} className="type-link">
            {side === "seeker" ? "See who offers this" : "See who needs this"} →
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** A short live list from the board. */
export async function LivePosts({ kind, category, limit = 5, empty }: { kind?: PostKind; category?: string; limit?: number; empty?: string }) {
  const q = new URLSearchParams({ limit: String(limit) });
  if (kind) q.set("kind", kind);
  if (category) q.set("category", category);
  const posts = await load<Post[]>(`/posts?${q}`);
  if (!posts) return <p className="note">The live board appears here when the API is running.</p>;
  if (!posts.length) return <p className="note">{empty ?? "Nothing open here yet."}</p>;
  return (
    <div className="live">
      {posts.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.06}>
          <Link href={`/posts/${p.id}`}>
            <span className={`tag ${p.kind === "REQUEST" ? "req" : "off"}`}>{KIND_LABEL[p.kind]} · {NEED_LABEL[p.need]}</span>
            <span className="t">{p.title}</span>
            <span className="org dim">{p.owner.orgName}</span>
            <span className="amt">{range(p.amountMin, p.amountMax)}</span>
            <span className="arr" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function Faq({ items }: { items: [string, string][] }) {
  return (
    <Reveal className="faq">
      {items.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
    </Reveal>
  );
}

/** Numbered tips in a row. */
export function Tips({ items, tone = "pine" }: { items: [string, string][]; tone?: "pine" | "plum" }) {
  return (
    <section className={`steps3 steps-${tone}`}>
      {items.map(([t, d], i) => (
        <Reveal key={t} delay={i * 0.1}>
          <span className="mono">{String(i + 1).padStart(2, "0")}</span>
          <h3>{t}</h3>
          <p>{d}</p>
        </Reveal>
      ))}
    </section>
  );
}
