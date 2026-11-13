import type { Metadata } from "next";
import { CategoryGrid, Faq, LivePosts, SectionHead, SupportTypes, Tips } from "@/components/Blocks";
import { Photo } from "@/components/Photo";
import { Reveal, RevealText } from "@/components/Reveal";
import { CtaBand, Steps } from "@/components/Sections";
import { SplitButton } from "@/components/SplitButton";

export const metadata: Metadata = { title: "Back something" };

export const dynamic = "force-dynamic";

export default function Backers() {
  return (
    <>
      <section className="sub t-plum on-dark">
        <div className="sub-copy">
          <Reveal as="span" className="mono">For backers</Reveal>
          <RevealText as="h1" className="d1" parts={["Put your budget where it ", { em: "matters." }]} delay={0.15} />
          <Reveal delay={0.5}><p className="body">For brands, companies, funds, foundations and CSR teams with money, products or expertise to give.</p></Reveal>
          <Reveal delay={0.65} className="acts">
            <SplitButton href="/signup?as=backer" variant="onblock">Post what you will back</SplitButton>
            <SplitButton href="/explore?kind=REQUEST" variant="ghost">See who is seeking</SplitButton>
          </Reveal>
        </div>
        <Photo src="/img/signing.jpg" alt="Someone signing an agreement" priority delay={0.3} sizes="(max-width: 960px) 100vw, 40vw" />
      </section>

      <Steps tone="plum" items={[
        ["Browse or post", "Look through people seeking backing, or post what you will back and who it is for."],
        ["Compare proposals", "Every proposal states an amount and a reason, side by side in one list."],
        ["You decide", "Accept the ones you want. Nothing is shared and nobody is matched until you say yes."],
      ]} />
      <section className="pad sec">
        <SectionHead label="Ways to back" title={["Money is one way. ", { em: "There are three more." }]} />
        <SupportTypes side="backer" />
      </section>

      <section className="pad sec t-off">
        <SectionHead label="Seeking backing right now" title={["People ", { ask: "ready for a yes" }]} action={{ label: "See everyone seeking", href: "/explore?kind=REQUEST" }} />
        <LivePosts kind="REQUEST" limit={5} />
      </section>

      <section className="pad sec">
        <SectionHead label="Who you can back" title={["Pick the kind of work ", { ask: "your customers care about" }]} action={{ label: "All categories", href: "/for" }} />
        <CategoryGrid />
      </section>

      <section className="pad sec" style={{ paddingTop: 0 }}>
        <SectionHead label="Choosing well" title={["Three checks ", { em: "before you say yes" }]} />
        <Tips tone="plum" items={[
          ["Does the audience fit?", "Look at who they reach and how often, not just how many."],
          ["Is the ask clear?", "A good post names the amount, the deadline and what you get back."],
          ["Can you take part?", "The best matches give your team something to do, not just a logo to place."],
        ]} />
      </section>

      <section className="pad sec t-off">
        <SectionHead label="Questions" title="Things backers ask first" />
        <Faq items={[
          ["Do I pay through MatchMint?", "Not yet. Once matched you agree terms and payment directly with the seeker."],
          ["Can I back more than one post?", "Yes. Send as many proposals as you like, or accept several on your own Offering post."],
          ["Can I post a budget and let people apply?", "Yes. Post an Offering with your budget and who it is for. Proposals arrive in one list."],
          ["Is anything shared before I decide?", "No. Contact details are shared only when a proposal is accepted."],
        ]} />
      </section>

      <CtaBand />
    </>
  );
}
