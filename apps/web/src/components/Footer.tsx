"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { Reveal } from "./Reveal";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  return (
    <form
      className="nl-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        try { await api("/leads", { method: "POST", body: { kind: "newsletter", email }, auth: false }); setState("done"); setEmail(""); }
        catch { setState("error"); }
      }}
    >
      <label className="sr" htmlFor="nl">Email address</label>
      <input id="nl" type="email" required placeholder={state === "done" ? "Thank you. You are on the list." : "you@example.org"} value={email} onChange={(e) => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }} />
      <button type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending" : "Subscribe"}</button>
      {state === "error" && <p className="mono nl-err" role="alert">Could not subscribe. Try again.</p>}
    </form>
  );
}

const COLS = [
  { title: "Product", links: [["How it works", "/how-it-works"], ["Explore the board", "/explore"], ["Create a post", "/posts/new"], ["Sign in", "/login"]] },
  { title: "For you", links: [["Get backed", "/seekers"], ["Back something", "/backers"], ["Startups", "/for/startups"], ["NGOs", "/for/ngos"], ["All categories", "/for"]] },
  { title: "MatchMint", links: [["About", "/about"], ["Contact", "/contact"]] },
];

/** Marketing footer: what MatchMint is and the letter on dark green, the links on maroon. */
export function Footer() {
  return (
    <footer className="ft on-dark">
      <div className="ft-half t-pine">
        <Reveal className="ft-letter">
          <p className="ft-about">MatchMint connects people who need backing with <em>the people ready to give it.</em></p>
          <p className="small">One email a month with new posts and what got backed.</p>
          <NewsletterForm />
        </Reveal>
        <div className="mono dim ft-meta"><span>© {new Date().getFullYear()} MatchMint</span><span>Free to post, free to match</span></div>
      </div>
      <div className="ft-half t-plum">
        <div className="ft-cols">
          {COLS.map((c, i) => (
            <Reveal key={c.title} delay={0.08 * (i + 1)} className="ft-col">
              <span className="mono dim">{c.title}</span>
              <ul>{c.links.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul>
            </Reveal>
          ))}
        </div>
        <div className="mono dim ft-meta"><span>For startups, NGOs, businesses, fests and communities</span></div>
      </div>
    </footer>
  );
}

export function SlimFooter() {
  return (
    <footer className="ft-slim pad mono">
      <span className="dim">© {new Date().getFullYear()} MatchMint</span>
      <nav>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  );
}
