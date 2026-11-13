import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Logo";
import { PostCard } from "@/components/PostCard";
import { SplitButton } from "@/components/SplitButton";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

type Swatch = { name: string; hex: string; token: string; role: string; dark?: boolean };

const COLOURS: { group: string; note: string; items: Swatch[] }[] = [
  { group: "Neutrals", note: "Pages are white or a cool off-white. Never cream.", items: [
    { name: "White", hex: "#FFFFFF", token: "--white", role: "Page background, buttons on dark blocks" },
    { name: "Off-white", hex: "#F4F5F7", token: "--off", role: "Alternate sections, panels, inputs" },
    { name: "Ink", hex: "#101315", token: "--ink", role: "Text, default buttons", dark: true },
  ] },
  { group: "Greens", note: "The seeker side. Dark green blocks carry light green words.", items: [
    { name: "Dark green", hex: "#1B4B36", token: "--pine", role: "Seeker blocks, footer half, text on light green", dark: true },
    { name: "Light green", hex: "#AEBD77", token: "--olive", role: "Seeker hero button, words on dark green" },
    { name: "Forest", hex: "#2F5241", token: "--forest", role: "Hover state of dark green", dark: true },
    { name: "Ice", hex: "#E0E7F1", token: "--ice", role: "Quiet panels, contact page" },
  ] },
  { group: "Maroons and pinks", note: "The backer side. Maroon blocks carry pink words.", items: [
    { name: "Maroon", hex: "#56132A", token: "--plum", role: "Backer blocks, footer half", dark: true },
    { name: "Deep maroon", hex: "#301114", token: "--maroon", role: "Darkest maroon, text on pink", dark: true },
    { name: "Wine", hex: "#741938", token: "--red", role: "Hover state of maroon", dark: true },
    { name: "Pink", hex: "#C61951", token: "--crimson", role: "Backer hero button, highlighted words", dark: true },
    { name: "Coral", hex: "#F64662", token: "--salmon", role: "Words and accents on maroon" },
  ] },
  { group: "Blues", note: "Used sparingly, only to tell categories apart.", items: [
    { name: "Blue", hex: "#2866AB", token: "--blue", role: "Category colour", dark: true },
    { name: "Navy", hex: "#073059", token: "--navy", role: "Category colour", dark: true },
    { name: "Slate", hex: "#152A38", token: "--slate", role: "Category colour", dark: true },
  ] },
];

const TYPE: [string, string, string][] = [
  ["d1", "Display", "Hero and page headlines. Geist 400, tight letter spacing."],
  ["d2", "Section headline", "One per section, with up to two highlighted phrases."],
  ["d3", "Block headline", "Inside coloured blocks and cards."],
  ["d4", "Small headline", "Lists and captions."],
];

const RULES: [string, string][] = [
  ["Two sides, two colours", "Green always means seekers. Maroon always means backers. Put them side by side, never on top of each other."],
  ["Buttons", "Light green and pink in the hero only. Everywhere else black on white, or white on dark blocks."],
  ["Square corners", "Buttons, cards, photos and panels have square corners."],
  ["Sentence case", "No small all-caps labels and no long dashes in front of labels."],
  ["One accent per surface", "Pink on white, light green on dark green, coral on maroon."],
  ["Medium green is retired", "#538F6A is not used anywhere."],
];

function Sw({ s }: { s: Swatch }) {
  return (
    <div className="ds-sw">
      <span className="ds-chip" style={{ background: s.hex, color: s.dark ? "#fff" : "#101315" }}>{s.hex}</span>
      <b>{s.name}</b>
      <code>{s.token}</code>
      <span className="dim">{s.role}</span>
    </div>
  );
}

export default function DesignSystem() {
  return (
    <div className="ds">
      <section className="intro pad">
        <span className="mono dim">MatchMint</span>
        <h1 className="d1">Design system</h1>
        <p className="body">Colours, type, buttons and building blocks, drawn from the same styles as the live site. If something changes here, it changes everywhere.</p>
        <nav className="ds-nav">
          {[["buttons", "Hero buttons"], ["colour", "Colour"], ["type", "Type"], ["components", "Components"], ["blocks", "Two-tone blocks"], ["motion", "Motion"], ["rules", "Rules"]].map(([id, l]) => <a key={id} href={`#${id}`}>{l}</a>)}
        </nav>
      </section>

      <section className="pad ds-sec" id="buttons">
        <div className="ds-h"><span className="mono dim">01</span><h2 className="d2">Hero buttons</h2></div>
        <p className="body">The only coloured buttons on the site. Light green for the seeker side, pink for the backer side. Every other button is black on white, or white on dark green and maroon.</p>
        <div className="ds-pairs">
          <figure className="ds-pair">
            <div className="ds-mock">
              <p className="ds-mock-h">Where <span style={{ color: "var(--olive)" }}>good work</span> finds its <em>backers</em></p>
              <div className="acts">
                <SplitButton href="/" variant="seek">I need backing</SplitButton>
                <SplitButton href="/" variant="back">I want to back something</SplitButton>
              </div>
            </div>
            <figcaption><b>Light green and pink</b><span>Light green #AEBD77 with dark green text. Pink #C61951 with white text.</span></figcaption>
          </figure>
          <figure className="ds-pair">
            <div className="ds-mock">
              <p className="ds-mock-h">Everywhere else</p>
              <div className="acts">
                <SplitButton href="/">Default on white</SplitButton>
              </div>
            </div>
            <figcaption><b>Black and white</b><span>Black with white text on light pages. White with black text on dark blocks.</span></figcaption>
          </figure>
          <figure className="ds-pair">
            <div className="ds-mock t-pine on-dark" style={{ borderColor: "transparent" }}>
              <p className="ds-mock-h" style={{ color: "var(--olive)" }}>On dark blocks</p>
              <div className="acts">
                <SplitButton href="/" variant="onblock">White on dark</SplitButton>
              </div>
            </div>
            <figcaption><b>White on dark green and maroon</b><span>Never a coloured button on a coloured block.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="pad ds-sec" id="colour">
        <div className="ds-h"><span className="mono dim">02</span><h2 className="d2">Colour</h2></div>
        {COLOURS.map((g) => (
          <div key={g.group} className="ds-group">
            <div><h3 className="d4">{g.group}</h3><p className="dim">{g.note}</p></div>
            <div className="ds-sws">{g.items.map((s) => <Sw key={s.token} s={s} />)}</div>
          </div>
        ))}
        <div className="ds-group">
          <div><h3 className="d4">Retired</h3><p className="dim">Do not use.</p></div>
          <div className="ds-sws"><div className="ds-sw ds-off"><span className="ds-chip" style={{ background: "#538F6A", color: "#fff" }}>#538F6A</span><b>Medium green</b><span className="dim">Removed from the project</span></div></div>
        </div>
      </section>

      <section className="pad ds-sec" id="type">
        <div className="ds-h"><span className="mono dim">03</span><h2 className="d2">Type</h2></div>
        <p className="body">One family: Geist. Headlines are regular weight with tight spacing; emphasis is colour, never bold or italic.</p>
        <div className="ds-type">
          {TYPE.map(([cls, name, note]) => (
            <div key={cls}>
              <div className="ds-type-meta"><b>{name}</b><code>.{cls}</code><span className="dim">{note}</span></div>
              <p className={cls}>Good work finds its <em>backers</em></p>
            </div>
          ))}
          <div>
            <div className="ds-type-meta"><b>Body</b><code>.body</code><span className="dim">15px, 1.55 line height, 46 characters wide at most.</span></div>
            <p className="body">Post what you need, or what you want to back. MatchMint brings the two sides together, and the side that pays makes the call.</p>
          </div>
          <div>
            <div className="ds-type-meta"><b>Label</b><code>.mono</code><span className="dim">Small sentence-case label above headlines.</span></div>
            <p className="mono dim">Two kinds of posts</p>
          </div>
        </div>
      </section>

      <section className="pad ds-sec" id="components">
        <div className="ds-h"><span className="mono dim">04</span><h2 className="d2">Components</h2></div>

        <h3 className="d4 ds-sub">Buttons</h3>
        <div className="ds-row3">
          <div className="ds-surf t-white"><span className="mono dim">On white</span><div className="acts"><SplitButton href="#">Default</SplitButton><SplitButton href="#" variant="seek">Seeker (hero)</SplitButton><SplitButton href="#" variant="back">Backer (hero)</SplitButton></div></div>
          <div className="ds-surf t-pine on-dark"><span className="mono" style={{ color: "var(--olive)" }}>On dark green</span><div className="acts"><SplitButton href="#" variant="onblock">Post what you need</SplitButton><SplitButton href="#" variant="ghost">Secondary</SplitButton></div></div>
          <div className="ds-surf t-plum on-dark"><span className="mono" style={{ color: "var(--salmon)" }}>On maroon</span><div className="acts"><SplitButton href="#" variant="onblock">Post what you will back</SplitButton><SplitButton href="#" variant="ghost">Secondary</SplitButton></div></div>
        </div>
        <p className="dim ds-note">Hover any button: the label rolls over and the arrow moves on.</p>

        <h3 className="d4 ds-sub">Tags and status</h3>
        <div className="ds-inline">
          <span className="tag req">Seeking · Funding</span>
          <span className="tag off">Offering · Sponsorship</span>
          <span className="pill PENDING">Pending</span>
          <span className="pill ACCEPTED">Accepted</span>
          <span className="pill DECLINED">Declined</span>
          <span className="pill CLOSED">Closed</span>
        </div>

        <h3 className="d4 ds-sub">Form fields</h3>
        <div className="ds-form f">
          <div className="f-row">
            <label className="fld"><span>Title</span><input defaultValue="Fund 50,000 native saplings" /></label>
            <label className="fld"><span>Category</span><select defaultValue="NGO"><option>NGO</option><option>Startup</option></select></label>
          </div>
          <label className="check"><input type="checkbox" defaultChecked /><span><b>No money involved</b><small>You need time, skills, products, space or a partner, not cash.</small></span></label>
          <p className="note">Notes look like this.</p>
          <p className="note err">Errors look like this.</p>
          <p className="note ok">Success looks like this.</p>
        </div>

        <h3 className="d4 ds-sub">Post card</h3>
        <div className="ds-cards">
          <PostCard post={{ kind: "REQUEST", need: "FUNDING", category: "NGO", title: "Fund 50,000 native saplings before the 2027 monsoon", summary: "We plant and maintain native trees on degraded land near Pune with 4,000 volunteers.", amountMin: 500000, amountMax: 5000000, deadline: "2027-04-30", location: "Pune", owner: { orgName: "GreenRoots Foundation" } }} />
          <PostCard post={{ kind: "OFFER", need: "SPONSORSHIP", category: "Sports", title: "Sponsoring 10 university sports teams this season", summary: "Cash, full kit and product for teams with a real following on campus.", amountMin: 100000, amountMax: 300000, deadline: "2026-12-31", location: "India", owner: { orgName: "Kestrel Energy" } }} />
          <PostCard post={{ kind: "REQUEST", need: "IN_KIND", category: "Community", title: "A venue for our monthly builders meetup", summary: "180 regulars, one evening a month. We need a room, not money.", amountMin: 0, amountMax: 0, deadline: null, location: "Kochi", owner: { orgName: "Kochi Builders" } }} />
        </div>

        <h3 className="d4 ds-sub">Logo</h3>
        <div className="ds-inline">
          <span className="logo"><Mark />MatchMint</span>
          <span className="ds-logo t-pine"><Mark a="#fff" b="#aebd77" size={40} /></span>
          <span className="ds-logo t-plum"><Mark a="#fff" b="#f64662" size={40} /></span>
          <Link href="/logos" className="ds-try">All ten logo concepts →</Link>
        </div>
      </section>

      <section className="ds-sec" id="blocks">
        <div className="pad"><div className="ds-h"><span className="mono dim">05</span><h2 className="d2">Two-tone blocks</h2></div>
          <p className="body">The signature layout: the seeker side in dark green, the backer side in maroon, side by side.</p></div>
        <div className="cta2" style={{ marginTop: 28 }}>
          <div className="t-pine on-dark"><span className="mono" style={{ color: "var(--olive)" }}>For seekers</span><h2 className="d1">Something worth backing?</h2><span><SplitButton href="#" variant="onblock">Post what you need</SplitButton></span></div>
          <div className="t-plum on-dark"><span className="mono" style={{ color: "var(--salmon)" }}>For backers</span><h2 className="d1">A budget looking for it?</h2><span><SplitButton href="#" variant="onblock">Post what you will back</SplitButton></span></div>
        </div>
      </section>

      <section className="pad ds-sec" id="motion">
        <div className="ds-h"><span className="mono dim">06</span><h2 className="d2">Motion</h2></div>
        <div className="ds-table">
          {[["Easing", "cubic-bezier(0.22, 1, 0.36, 1): fast start, long gentle finish"], ["Headlines", "Rise word by word from behind a mask, 1.6s"], ["Photos", "Wipe up into view, 1.9s, then drift slightly while scrolling"], ["Blocks and text", "Fade and lift 34px, 1.5s"], ["Page scroll", "Smoothed with Lenis, 1.55s easing"], ["Closing section", "Driven by scroll: words brighten one by one"], ["Reduced motion", "All of the above switch off when the system asks for less motion"]].map(([k, v]) => (
            <div key={k}><b>{k}</b><span>{v}</span></div>
          ))}
        </div>
      </section>

      <section className="pad ds-sec" id="rules">
        <div className="ds-h"><span className="mono dim">07</span><h2 className="d2">Rules</h2></div>
        <div className="ds-rules">
          {RULES.map(([t, d], i) => (
            <div key={t} className={i % 2 ? "t-plum on-dark" : "t-pine on-dark"}><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}
