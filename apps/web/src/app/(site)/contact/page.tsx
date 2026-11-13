import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <section className="contact t-ice">
      <div className="contact-side on-dark">
        <Photo src="/img/contact.jpg" alt="A small team talking around a table" priority sizes="(max-width: 860px) 100vw, 50vw">
          <div className="contact-note">
            <span className="mono" style={{ color: "var(--olive)" }}>We read everything</span>
            <p>Questions, ideas, or something you wish MatchMint did. Write to us.</p>
          </div>
        </Photo>
      </div>
      <div className="contact-form">
        <h1 className="d1" style={{ fontSize: "clamp(2.6rem, 5.4vw, 5rem)" }}>Let&rsquo;s talk</h1>
        <ContactForm />
      </div>
    </section>
  );
}
