import type { Metadata } from "next";
import { ACTIVE_MARK, MARKS, Mark } from "@/components/Logo";

export const metadata: Metadata = { title: "Logo concepts", robots: { index: false, follow: false } };

export default function Logos() {
  return (
    <>
      <section className="intro pad">
        <span className="mono dim">Identity · 10 concepts</span>
        <h1 className="d1">Pick a logo</h1>
        <p className="body">Each mark is shown as a full lockup on white, then alone on maroon and on ice. Tell me the number you like and I will apply it everywhere. The site currently uses number {String(ACTIVE_MARK + 1).padStart(2, "0")}.</p>
      </section>
      <section className="pad" style={{ paddingBottom: "clamp(64px, 8vw, 120px)" }}>
        <div className="lg-grid">
          {MARKS.map((m, i) => (
            <figure className="lg" key={m.name}>
              <div className="t-white">
                <span className="mono dim n">{String(i + 1).padStart(2, "0")}</span>
                <span className="lock"><Mark index={i} a="#101315" b="#c61951" size={34} />MatchMint</span>
              </div>
              <div className="t-maroon"><Mark index={i} a="#ffffff" b="#f64662" size={64} /></div>
              <div className="t-ice"><Mark index={i} a="#1b4b36" b="#aebd77" size={64} /></div>
              <figcaption className="lg-meta">
                <span className="d4">{m.name}{i === ACTIVE_MARK ? " (in use)" : ""}</span>
                <p>{m.idea}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
