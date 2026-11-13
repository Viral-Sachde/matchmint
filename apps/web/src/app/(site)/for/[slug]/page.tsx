import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq, SectionHead, Tips } from "@/components/Blocks";
import { CategoryBoard } from "@/components/CategoryBoard";
import { Photo } from "@/components/Photo";
import { Reveal, RevealText } from "@/components/Reveal";
import { CtaBand } from "@/components/Sections";
import { SplitButton } from "@/components/SplitButton";
import { BY_SLUG, CATEGORY_PAGES } from "@/lib/categories";
import { CATEGORY_INFO, NEED_LABEL } from "@/lib/constants";

export function generateStaticParams() {
  return CATEGORY_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = BY_SLUG[slug];
  return c ? { title: CATEGORY_INFO[c.key].plural, description: c.intro } : { title: "Not found" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = BY_SLUG[slug];
  if (!c) notFound();
  const info = CATEGORY_INFO[c.key];
  const article = /^[aeiou]/i.test(c.name) && c.name !== "university" ? "an" : "a";

  return (
    <>
      <section className="sub t-pine on-dark">
        <div className="sub-copy">
          <Reveal as="span" className="mono"><Link href="/for">Who it is for</Link> / {info.plural}</Reveal>
          <RevealText as="h1" className="d1 cat-h1" parts={c.title} delay={0.15} />
          <Reveal delay={0.5}><p className="body">{c.intro}</p></Reveal>
          <Reveal delay={0.65} className="acts">
            <SplitButton href={`/posts/new?category=${encodeURIComponent(c.key)}`} variant="onblock">{`Post as ${article} ${c.name}`}</SplitButton>
            <SplitButton href="#board" variant="ghost">See what is open</SplitButton>
          </Reveal>
        </div>
        <Photo src={info.img} alt="" priority delay={0.3} sizes="(max-width: 960px) 100vw, 40vw" />
      </section>

      <section className="pad sec">
        <SectionHead label={`What ${info.plural.toLowerCase()} look for`} title={["Four kinds of support, ", { em: "with typical amounts" }]} />
        <Reveal className="needs">
          {c.needs.map((n) => (
            <div key={n.need}>
              <span className="tag req">{NEED_LABEL[n.need]}</span>
              <span className="needs-what">{n.what}</span>
              <span className="needs-range">{n.range}</span>
              <Link href={`/explore?category=${encodeURIComponent(c.key)}&need=${n.need}`} className="arr" aria-label={`${NEED_LABEL[n.need]} posts`}>→</Link>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="pad">
        <div className="pair2">
          <Reveal className="t-pine on-dark">
            <span className="mono" style={{ color: "var(--olive)" }}>Who backs {info.plural.toLowerCase()}</span>
            <h3 className="d3">{c.whoBacks}</h3>
            <div className="pair2-ex">
              <span className="mono dim">A typical post</span>
              <b>{c.example.title}</b>
              <span>Asking {c.example.ask}</span>
              <span className="dim">In return: {c.example.gives}</span>
            </div>
          </Reveal>
          <Reveal className="t-plum on-dark" delay={0.1}>
            <span className="mono" style={{ color: "var(--salmon)" }}>What backers get</span>
            <ul className="pair2-list">{c.backersGet.map((g) => <li key={g}>{g}</li>)}</ul>
            <span><SplitButton href={`/explore?category=${encodeURIComponent(c.key)}&kind=REQUEST`} variant="onblock">{`Back ${info.plural.toLowerCase()}`}</SplitButton></span>
          </Reveal>
        </div>
      </section>

      <section className="sec" id="board">
        <div className="pad"><SectionHead label="Open now" title={[{ ask: info.plural }, " on the board"]} /></div>
        <CategoryBoard category={c.key} plural={info.plural} />
      </section>

      <section className="pad sec" style={{ paddingTop: 0 }}>
        <SectionHead label="Before you post" title={["How to write ", { ask: "a post that gets backed" }]} />
        <Tips items={c.tips} />
      </section>

      <section className="pad sec t-off">
        <SectionHead label="Questions" title={`Things ${info.plural.toLowerCase()} ask`} />
        <Faq items={c.faq} />
      </section>

      <section className="pad sec-s">
        <Reveal as="span" className="mono dim">Other kinds of work</Reveal>
        <div className="chips">
          {CATEGORY_PAGES.filter((o) => o.slug !== c.slug).map((o) => (
            <Link key={o.slug} href={`/for/${o.slug}`}>{CATEGORY_INFO[o.key].plural}</Link>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
