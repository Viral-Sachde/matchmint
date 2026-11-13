import type { Metadata } from "next";
import { CategoryGrid, SectionHead } from "@/components/Blocks";
import { Reveal, RevealText } from "@/components/Reveal";
import { CtaBand } from "@/components/Sections";

export const metadata: Metadata = { title: "Who it is for" };

export default function Categories() {
  return (
    <>
      <section className="intro pad">
        <Reveal as="span" className="mono dim">Who it is for</Reveal>
        <RevealText as="h1" className="d1" parts={["Ten kinds of work ", { ask: "worth backing" }]} delay={0.1} />
        <Reveal delay={0.4}><p className="body">Each has its own page with what they usually look for, typical amounts, what backers get in return and what is open right now.</p></Reveal>
      </section>
      <section className="pad" style={{ paddingBottom: "clamp(56px, 10svh, 120px)" }}>
        <CategoryGrid />
      </section>
      <section className="pad sec t-off">
        <SectionHead label="Not sure where you fit?" title={["Pick the closest one. ", { em: "You can change it on any post." }]} action={{ label: "Create a post", href: "/posts/new" }} />
      </section>
      <CtaBand />
    </>
  );
}
