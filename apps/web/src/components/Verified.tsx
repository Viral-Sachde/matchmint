/** A tick shown beside organisations MatchMint has verified. */
export function Verified({ label = false }: { label?: boolean }) {
  return (
    <span className="vf" title="Verified by MatchMint">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0l1.7 1.6 2.3-.4.6 2.3 2.1 1-1 2.1 1 2.1-2.1 1-.6 2.3-2.3-.4L7 13.2l-1.7-1.6-2.3.4-.6-2.3-2.1-1 1-2.1-1-2.1 2.1-1 .6-2.3 2.3.4z" fill="currentColor" /><path d="M4.4 6.8l1.8 1.8 3.4-3.6" fill="none" stroke="#fff" strokeWidth="1.4" /></svg>
      {label ? <span>Verified</span> : <span className="sr">Verified</span>}
    </span>
  );
}
