"use client";

import { useCallback, useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthScreen";
import { api } from "@/lib/api";
import { ORG_LABEL } from "@/lib/constants";
import { ago } from "@/lib/format";
import type { Org } from "@/lib/types";

/** For MatchMint staff: approve or turn down verification requests. */
export function Admin() {
  const { user, ready } = useRequireAuth();
  const [rows, setRows] = useState<Org[] | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  const load = useCallback(() => api<Org[]>("/admin/verifications").then(setRows).catch((e) => setError((e as Error).message)), []);
  useEffect(() => { if (user) load(); }, [user, load]);

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try { await api(`/admin/verifications/${id}`, { method: "PATCH", body: { action, note: notes[id] ?? "" } }); await load(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(""); }
  };

  if (!ready || !user) return <div className="pad p-head"><p className="mono dim">Loading</p></div>;
  const pending = rows?.filter((o) => o.verification === "PENDING") ?? [];
  const done = rows?.filter((o) => o.verification !== "PENDING") ?? [];

  return (
    <div className="pad">
      <div className="p-head"><div><span className="mono dim">MatchMint staff</span><h1>Verifications</h1><p className="body">Check each organisation&rsquo;s registration, then approve it or send it back with a reason.</p></div></div>
      {error && <p className="note err" role="alert">{error}</p>}
      <section className="dash-sec">
        <h2>Waiting for review ({pending.length})</h2>
        {rows && !pending.length && <p className="note">Nothing waiting.</p>}
        <div className="tbl">
          {pending.map((o) => (
            <div className="tr" key={o.id} style={{ gridTemplateColumns: "1fr auto" }}>
              <div>
                <span className="t">{o.name}</span>
                <span className="sub">{ORG_LABEL[o.type]} · {o.location || "No location"}{o.website ? ` · ${o.website}` : ""} · sent {o.verificationAt ? ago(o.verificationAt) : ""}</span>
              </div>
              <span className="acts">
                <button className="box sm" disabled={busy === o.id} onClick={() => decide(o.id, "approve")}>Approve</button>
                <button className="box sm line danger" disabled={busy === o.id} onClick={() => decide(o.id, "reject")}>Turn down</button>
              </span>
              <p className="msg"><b>{o.regType}:</b> {o.regNumber}{o.docUrl ? <> · <a className="linkish" href={o.docUrl} target="_blank" rel="noopener noreferrer">Document</a></> : null}{o.verificationNote ? <> · {o.verificationNote}</> : null}</p>
              <label className="fld" style={{ gridColumn: "1 / -1", maxWidth: 560 }}><span>Note to the organisation (shown if turned down)</span><input value={notes[o.id] ?? ""} onChange={(e) => setNotes({ ...notes, [o.id]: e.target.value })} maxLength={400} /></label>
            </div>
          ))}
        </div>
      </section>
      <section className="dash-sec" style={{ marginTop: 40 }}>
        <h2>Already reviewed</h2>
        <div className="tbl">
          {done.map((o) => (
            <div className="tr" key={o.id} style={{ gridTemplateColumns: "1fr auto" }}>
              <div><span className="t">{o.name}</span><span className="sub">{ORG_LABEL[o.type]}{o.regType ? ` · ${o.regType}: ${o.regNumber}` : ""}</span></div>
              <span className={`pill ${o.verification === "VERIFIED" ? "ACCEPTED" : "DECLINED"}`}>{o.verification === "VERIFIED" ? "Verified" : "Turned down"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
