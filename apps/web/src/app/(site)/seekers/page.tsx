import type { Metadata } from "next";
import { CategoryGrid, Faq, LivePosts, SectionHead, SupportTypes } from "@/components/Blocks";
import { PostCard } from "@/components/PostCard";
import { Photo } from "@/components/Photo";
import { Reveal, RevealText } from "@/components/Reveal";
import { CtaBand, Steps } from "@/components/Sections";
import { SplitButton } from "@/components/SplitButton";

export const metadata: Metadata = { title: "Get backed" };

export const dynamic = "force-dynamic";

export default function Seekers() {
  return (
    <>
      <section className="sub t-pine on-dark">
        <div className="sub-copy">
          <Reveal as="span" className="mono">For seekers</Reveal>
          <RevealText as="h1" className="d1" parts={["Stop cold emailing. ", { em: "Get backed." }]} delay={0.15} />
          <Reveal delay={0.5}><p className="body">For NGOs, student festivals, creators, communities, events, teams and young companies who need funding, a sponsor or a partner.</p></Reveal>
          <Reveal delay={0.65} className="acts">
            <SplitButton href="/signup?as=seeker" variant="onblock">Post what you need</SplitButton>
            <SplitButton href="/explore?kind=OFFER" variant="ghost">See who is offering</SplitButton>
          </Reveal>
        </div>
        <Photo src="/img/volunteer.jpg" alt="A volunteer at a community event" priority delay={0.3} sizes="(max-width: 960px) 100vw, 40vw" />
      </section>

      <Steps tone="pine" items={[
        ["Write one clear post", "Who you are, what you need, how much, and what a backer gets in return."],
        ["Proposals come to you", "Backers reply with an amount and a short message. Or reply to people offering backing."],
        ["Accept and connect", "Accept the proposal you want and both of you get each other's contact details."],
      ]} />
      <section className="pad sec">
        <SectionHead label="What you can ask for" title={["Four kinds of support. ", { ask: "Ask for one, or a mix." }]} />
        <SupportTypes side="seeker" />
      </section>

      <section className="pad sec t-off">
        <SectionHead label="Offers open right now" title={["Backers already ", { em: "looking for you" }]} action={{ label: "See every offer", href: "/explore?kind=OFFER" }} />
        <LivePosts kind="OFFER" limit={5} empty="No offers are open right now. Post what you need and backers will find you." />
      </section>

      <section className="pad sec">
        <SectionHead label="Who can post" title={["Ten kinds of work, ", { ask: "each with its own page" }]} action={{ label: "All categories", href: "/for" }} />
        <CategoryGrid />
      </section>

      <section className="pad sec" style={{ paddingTop: 0 }}>
        <SectionHead label="Anatomy of a strong post" title={["What backers ", { em: "look at first" }]} />
        <div className="anatomy">
          <Reveal className="anatomy-card">
            <PostCard post={{ kind: "REQUEST", need: "FUNDING", category: "NGO", title: "Fund 50,000 native saplings before the 2027 monsoon", summary: "We plant and maintain native trees on degraded land near Pune with 4,000 volunteers. We need a CSR partner for the next season.", amountMin: 500000, amountMax: 5000000, deadline: "2027-04-30", location: "Pune", owner: { orgName: "GreenRoots Foundation" } }} />
          </Reveal>
          <ol className="anatomy-list">
            {[["A title that says the outcome", "50,000 saplings, not 'support our NGO'."], ["One or two plain sentences", "Who you are and what the money changes."], ["A real amount", "A range tells backers if they fit before they reply."], ["What a backer gets", "Named grove, volunteering days, an impact report."], ["A deadline", "A date gets replies sooner than an open-ended ask."]].map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.08}><span className="mono">{String(i + 1).padStart(2, "0")}</span><b>{t}</b><span>{d}</span></Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="pad sec t-off">
        <SectionHead label="Questions" title="Things seekers ask first" />
        <Faq items={[
          ["What does it cost to post?", "Nothing. Posting, receiving proposals and matching are free, and we take no commission."],
          ["Who sees my contact details?", "Nobody until you accept a proposal. Then only you and that backer."],
          ["Can I ask for more than one kind of support?", "Yes. Pick the main one on your post and describe the rest in the full story."],
          ["What if no one replies?", "Reply to offers that fit you, sharpen your title and amount, or add a deadline. All three help."],
        ]} />
      </section>

      <CtaBand />
    </>
  );
}
