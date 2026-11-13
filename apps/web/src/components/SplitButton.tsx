import Link from "next/link";

const Arrow = () => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" /></svg>
);

type Variant = "" | "light" | "plum" | "ghost" | "olive" | "pine" | "seek" | "back" | "onblock";
type Props = { children: string; href?: string; variant?: Variant; className?: string; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void };

function Inner({ label }: { label: string }) {
  return (
    <>
      <span className="sbtn-l" data-t={label}><span>{label}</span></span>
      <span className="sbtn-a"><Arrow /></span>
    </>
  );
}

/** Main button. On hover the label rolls over to a fresh copy and the arrow moves on. */
export function SplitButton({ children, href, variant = "", className = "", type = "button", disabled, onClick }: Props) {
  const cls = `sbtn ${variant} ${className}`;
  if (href) return <Link href={href} className={cls}><Inner label={children} /></Link>;
  return <button type={type} className={cls} disabled={disabled} onClick={onClick}><Inner label={children} /></button>;
}

/** Same look without being a link, for use inside a parent that is already one. */
export function SplitButtonStatic({ children, variant = "light" }: { children: string; variant?: Variant }) {
  return <span className={`sbtn ${variant}`}><Inner label={children} /></span>;
}
