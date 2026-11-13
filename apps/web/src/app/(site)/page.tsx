import Link from "next/link";
import { Audience } from "@/components/Audience";
import { Hero } from "@/components/Hero";
import { Reveal, RevealText } from "@/components/Reveal";
import { ScrollText } from "@/components/ScrollText";
import { ChipMatch, ChipPost, ChipProposals, CtaBand, Kinds, Rows } from "@/components/Sections";
import { SplitButton } from "@/components/SplitButton";
import { API_URL } from "@/lib/api";
import { KIND_LABEL, NEED_LABEL } from "@/lib/constants";
import { range } from "@/lib/format";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

async function load<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const TRUST: [string, string][] = [
  ["The payer decides", "Nothing moves without a yes from the side putting in the money. No surprises for either party."],
  ["Private until matched", "Your email and contact details stay hidden until a proposal is accepted, and then only the two of you see them."],
  ["Every ask has a number", "Posts and proposals state an amount up front, so nobody wastes weeks finding out the budget."],
  ["Free to use", "Posting, sending proposals and matching cost nothing. We take no commission on what you agree."],
  ["You deal directly", "Once matched, you talk to each other. No agents in the middle and no one rewriting your terms."],
  ["You stay in control", "Close your post, withdraw a proposal or decline one at any time, with a single click."],
];

export default async function Home() {
  const posts = await load<Post[]>("/posts?limit=6");

  return (
    <>
      <Hero />

      <section className="pad sec state">
        <Reveal as="span" className="mono dim">What this is</Reveal>
        <ScrollText
          className="d2"
          parts={[
            "Good work rarely fails for lack of effort. It stalls because the people ",
            { ask: "doing it" },
            " and the people who would ",
            { em: "gladly pay for it" },
            " never find each other. MatchMint is one board where both sides say what they have and what they need.",
          ]}
        />
      </section>

      <Kinds />

      <section className="pad sec" style={{ paddingTop: 0 }}>
        <div className="head">
          <div>
            <Reveal as="span" className="mono dim">Why trust it</Reveal>
            <RevealText as="h2" className="d2" parts={["Built so that ", { em: "a yes means yes." }]} />
          </div>
        </div>
        <Reveal className="trust">
          {TRUST.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}
        </Reveal>
      </section>

      <section className="pad" style={{ paddingTop: "clamp(24px, 4vw, 56px)" }}>
        <div className="head" style={{ paddingBottom: 0 }}>
          <div>
            <Reveal as="span" className="mono dim">How it works</Reveal>
            <RevealText as="h2" className="d2" parts={["Three steps, ", { em: "no pitch deck." }]} />
          </div>
          <Reveal><SplitButton href="/how-it-works">Try the demo</SplitButton></Reveal>
        </div>
      </section>
      <Rows
        items={[
          { title: "Write one clear post", body: "Who you are, what you need or what you will give, how much, and by when. It takes about five minutes and costs nothing.", cta: { label: "Create a post", href: "/posts/new" }, img: "/img/step-post.jpg", alt: "Someone working at a laptop", chip: <ChipPost /> },
          { title: "Proposals come to you", body: "People on the other side reply with a proposal: an amount and a short message. You see them side by side instead of chasing replies to cold emails.", cta: { label: "Browse the board", href: "/explore" }, img: "/img/step-proposals.jpg", alt: "People talking across a table with notebooks", chip: <ChipProposals /> },
          { title: "The side that pays decides", body: "Whoever puts in the money has the final word. Accept a proposal and both sides get each other's contact details. Decline and nothing is shared.", cta: { label: "See it step by step", href: "/how-it-works" }, img: "/img/step-decide.jpg", alt: "Two people shaking hands", chip: <ChipMatch /> },
        ]}
      />

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="head pad">
          <div>
            <Reveal as="span" className="mono dim">Who it is for</Reveal>
            <RevealText as="h2" className="d2" parts={["Ten kinds of work ", { ask: "worth backing." }]} />
          </div>
          <Reveal><SplitButton href="/for">All categories</SplitButton></Reveal>
        </div>
        <Reveal><Audience /></Reveal>
      </section>

      <section className="pad sec live-wrap" style={{ paddingTop: 0 }}>
        <div className="head">
          <div>
            <Reveal as="span" className="mono dim">The board</Reveal>
            <RevealText as="h2" className="d2" parts={["Open ", { em: "right now" }]} />
          </div>
          <Reveal><SplitButton href="/explore">See the full board</SplitButton></Reveal>
        </div>
        {posts && posts.length > 0 ? (
          <div className="live">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
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
        ) : (
          <p className="note">The live board appears here when the API is running. Start it with <code>npm run dev</code> from the project root.</p>
        )}
      </section>

      <CtaBand />
    </>
  );
}
