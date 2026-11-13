"use client";

import { useEffect, useRef, useState } from "react";

type Role = "seeker" | "backer";

const SCENARIO = {
  seeker: {
    you: "GreenRoots Foundation",
    youAre: "an NGO that needs funding",
    post: { tag: "Seeking · Funding", cls: "req", title: "Fund 50,000 native saplings before the monsoon", summary: "We plant and maintain native trees on degraded land near Pune with 4,000 volunteers.", amount: "₹5 L to ₹50 L" },
    steps: [
      ["You post what you need", "Say who you are, how much you need and what a backer gets in return."],
      ["Backers send proposals", "Each proposal is a backer saying yes, with the amount they would put in."],
      ["You confirm one", "Their money, their offer. You choose which proposal to take up."],
      ["You are matched", "Both sides get each other's contact details and take it from there."],
    ],
    proposals: [
      { org: "Northwind Bank", kind: "Company", amount: "₹25 L", msg: "We would fund 25,000 saplings under our climate mandate, with two staff volunteering days.", email: "sara@northwind.example" },
      { org: "Kestrel Energy", kind: "Brand", amount: "₹8 L", msg: "Happy to back 8,000 saplings and feature the drive on our channels." },
      { org: "Lumen Labs", kind: "Company", amount: "₹5 L", msg: "Our team would like to sponsor one grove and join a planting day." },
    ],
    cta: "Accept",
    hint: "Your turn. Accept the proposal you want.",
  },
  backer: {
    you: "Kestrel Energy",
    youAre: "a brand with a sponsorship budget",
    post: { tag: "Offering · Sponsorship", cls: "off", title: "Sponsoring 10 university sports teams this season", summary: "Cash, full kit and product for teams with a real following on campus.", amount: "₹1 L to ₹3 L per team" },
    steps: [
      ["You post what you will back", "Say how much is available, who it is for and when you will decide."],
      ["Seekers send proposals", "Each one says who they are and how much they are asking for."],
      ["You pick who to back", "You are paying, so the decision is yours alone."],
      ["You are matched", "Both sides get each other's contact details and take it from there."],
    ],
    proposals: [
      { org: "Delhi University Track Club", kind: "University team", amount: "₹2 L", msg: "Forty athletes, a full calendar from January to April, and 9,000 followers on campus.", email: "captain@dutrack.example" },
      { org: "IIT Madras Rowing", kind: "University team", amount: "₹3 L", msg: "We race at four national regattas. Kit branding is visible in every broadcast." },
      { org: "Pune Ultimate Frisbee", kind: "University team", amount: "₹1.5 L", msg: "A mixed squad of 28 that hosts the largest college tournament in the west." },
    ],
    cta: "Approve",
    hint: "Your turn. Approve the team you want to back.",
  },
} as const;

const AUTO_MS = 5200;

/** A small working model of the product. Steps one and two play by themselves; the decision is yours. */
export function Demo() {
  const [role, setRole] = useState<Role>("seeker");
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const sc = SCENARIO[role];

  // begin when the demo scrolls into view
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || step > 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [started, step, role]);

  const restart = (r: Role = role) => { setRole(r); setPicked(null); setStep(0); };
  const jump = (n: number) => { if (n === 3 && picked === null) setPicked(0); if (n < 3) setPicked(null); setStep(n); };
  const choose = (n: number) => { setPicked(n); setStep(3); };
  const chosen = sc.proposals[picked ?? 0];

  return (
    <div className="demo" ref={root}>
      <div className="demo-top">
        <div className="demo-role" role="group" aria-label="Choose a side">
          <button aria-pressed={role === "seeker"} onClick={() => restart("seeker")}>Try it as a seeker</button>
          <button aria-pressed={role === "backer"} onClick={() => restart("backer")}>Try it as a backer</button>
        </div>
        <span className="mono dim demo-you">You are {sc.you}, {sc.youAre}</span>
        <button className="mono demo-replay" onClick={() => restart()}>Replay</button>
      </div>

      <div className="demo-body">
        <ol className="demo-steps">
          {sc.steps.map(([t, d], n) => (
            <li key={t} className={n === step ? "on" : n < step ? "done" : ""}>
              <button onClick={() => jump(n)} aria-current={n === step ? "step" : undefined}>
                <span className="mono">{String(n + 1).padStart(2, "0")}</span>
                <span>
                  <b>{t}</b>
                  <span className="demo-d">{d}</span>
                </span>
                {n === step && started && step < 2 && <i key={`${role}${step}`} style={{ animationDuration: `${AUTO_MS}ms` }} />}
              </button>
            </li>
          ))}
        </ol>

        <div className="demo-screen" aria-live="polite">
          <div className="demo-chrome"><i /><i /><i /><span className="mono dim">matchmint / {step === 0 ? "new post" : step === 3 ? "matched" : "your post"}</span></div>

          <div className="demo-view" key={`${role}-${step}`}>
            {step === 0 && (
              <div className="demo-compose">
                <span className={`tag ${sc.post.cls}`} style={{ "--n": 0 } as React.CSSProperties}>{sc.post.tag}</span>
                <label style={{ "--n": 1 } as React.CSSProperties}><span className="mono dim">Title</span><b>{sc.post.title}</b></label>
                <label style={{ "--n": 2 } as React.CSSProperties}><span className="mono dim">In a sentence</span><span>{sc.post.summary}</span></label>
                <label style={{ "--n": 3 } as React.CSSProperties}><span className="mono dim">Amount</span><b>{sc.post.amount}</b></label>
                <span className="demo-pub" style={{ "--n": 4 } as React.CSSProperties}>Publish post</span>
              </div>
            )}

            {(step === 1 || step === 2) && (
              <>
                <div className="demo-post">
                  <span className={`tag ${sc.post.cls}`}>{sc.post.tag}</span>
                  <b>{sc.post.title}</b>
                </div>
                <p className="mono demo-hint">{step === 1 ? "Proposals arriving" : sc.hint}</p>
                <div className="demo-list">
                  {sc.proposals.map((p, n) => (
                    <div className="demo-prop" key={p.org} style={{ "--n": step === 1 ? n : 0, "--gap": step === 1 ? "1.1s" : "0s" } as React.CSSProperties}>
                      <span className="demo-av">{p.org[0]}</span>
                      <span className="demo-who"><b>{p.org}</b><span>{p.msg}</span></span>
                      <span className="demo-amt">{p.amount}</span>
                      {step === 2 && (
                        <span className="demo-acts">
                          <button className="box sm" onClick={() => choose(n)}>{sc.cta}</button>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="demo-match">
                <span className="mono">Matched</span>
                <div className="demo-pair">
                  <span><span className="demo-av big">{sc.you[0]}</span><b>{sc.you}</b></span>
                  <span className="demo-join" aria-hidden="true" />
                  <span><span className="demo-av big alt">{chosen.org[0]}</span><b>{chosen.org}</b></span>
                </div>
                <p className="demo-sum">{chosen.amount} agreed. Contact details are now shared with both sides.</p>
                <button className="box line" onClick={() => restart()}>Run it again</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
