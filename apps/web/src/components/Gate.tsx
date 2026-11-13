import Link from "next/link";
import { SplitButton } from "./SplitButton";

/** Shown to signed-out visitors where the preview ends. */
export function Gate({ title, next, flat = false }: { title: string; next: string; flat?: boolean }) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <div className={`gate-box ${flat ? "flat" : ""}`}>
      <h2>{title}</h2>
      <ul>
        <li>See every post, with the full story and what is offered in return</li>
        <li>Send proposals and reply to the ones you receive</li>
        <li>Free, and it takes a minute</li>
      </ul>
      <div className="gate-acts">
        <SplitButton href={`/signup${q}`}>Create a free account</SplitButton>
        <Link href={`/login${q}`} className="box line" style={{ height: 50 }}>Sign in</Link>
      </div>
    </div>
  );
}
