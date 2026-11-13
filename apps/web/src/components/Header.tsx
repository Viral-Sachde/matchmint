"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";
import { SplitButton } from "./SplitButton";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/explore", label: "Explore" },
  { href: "/for", label: "Who it is for" },
  { href: "/seekers", label: "Get backed" },
  { href: "/backers", label: "Back something" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // White logo over dark sections, ink over light ones: look at what sits behind the header.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const behind = (x: number) => document.elementsFromPoint(x, 38).find((el) => !el.closest(".hd, .menu, .menu-veil"));
      const left = behind(40), right = behind(window.innerWidth - 40);
      setDark(!!left?.closest(".on-dark"));
      document.documentElement.style.setProperty("--hd-right", right?.closest(".on-dark") ? "#fff" : "var(--ink)");
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(read); };
    // wait until the page has finished loading its saved markup before the first reading
    const first = setTimeout(read, 60);
    const t = setTimeout(read, 500);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => { clearTimeout(first); clearTimeout(t); cancelAnimationFrame(raf); window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); };
  }, [path]);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (open) window.__lenis?.stop(); else window.__lenis?.start();
    if (open) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (open) document.body.style.removeProperty("overflow"); };
  }, [open]);

  return (
    <>
      <header className={dark ? "hd is-dark" : "hd"}>
        <Logo />
        <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><i /><i /></button>
      </header>

      <div className={`menu-veil ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`menu ${open ? "open" : ""}`} aria-hidden={!open} inert={!open} data-lenis-prevent>
        <button className="menu-x" aria-label="Close menu" onClick={() => setOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.2" /></svg>
        </button>
        <nav className="menu-nav" aria-label="Menu">
          {LINKS.map((m, i) => (
            <Link key={m.href} href={m.href} style={{ "--i": i } as React.CSSProperties}><span>{m.label}</span></Link>
          ))}
        </nav>
        <div className="menu-foot">
          <div className="row">
            <SplitButton href="/posts/new">Create a post</SplitButton>
            <Link href={user ? "/dashboard" : "/login"} className="box line" style={{ height: 50 }}>{user ? "Dashboard" : "Sign in"}</Link>
          </div>
          {user && (
            <small>Signed in as {user.name}, {user.orgName}. <button onClick={() => { logout(); window.location.assign("/"); }}>Sign out</button></small>
          )}
        </div>
      </aside>
    </>
  );
}
