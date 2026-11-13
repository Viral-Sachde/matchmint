"use client";

import { useState } from "react";
import { SplitButton } from "@/components/SplitButton";
import { api } from "@/lib/api";

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", company: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  if (state === "done") return <p className="note ok" role="status">Thank you. Your message is in and we will reply within two working days.</p>;

  return (
    <form
      className="f"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy"); setError("");
        try { await api("/leads", { method: "POST", body: { kind: "contact", ...v }, auth: false }); setState("done"); }
        catch (err) { setError((err as Error).message); setState("idle"); }
      }}
    >
      <label className="fld"><span>Full name</span><input required value={v.name} onChange={set("name")} autoComplete="name" /></label>
      <label className="fld"><span>Email address</span><input required type="email" value={v.email} onChange={set("email")} autoComplete="email" /></label>
      <label className="fld"><span>Organisation</span><input value={v.company} onChange={set("company")} autoComplete="organization" /></label>
      <label className="fld"><span>Your message</span><textarea required value={v.message} onChange={set("message")} /></label>
      {error && <p className="note err" role="alert">{error}</p>}
      <div><SplitButton type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending" : "Submit"}</SplitButton></div>
    </form>
  );
}
