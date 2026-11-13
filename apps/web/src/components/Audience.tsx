"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SLUG_OF } from "@/lib/categories";
import { CATEGORIES, CATEGORY_INFO } from "@/lib/constants";
import { SplitButtonStatic } from "./SplitButton";

/** One strip per kind of work. The one under the pointer opens to show who it is for. */
export function Audience() {
  const [active, setActive] = useState(0); // open on the first
  return (
    <div className="aud">
      {CATEGORIES.map((c, i) => {
        const info = CATEGORY_INFO[c];
        return (
          <Link
            key={c}
            href={`/for/${SLUG_OF[c]}`}
            className={`aud-s hov ${active === i ? "on" : ""}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <Image src={info.img} alt="" fill sizes="(max-width: 860px) 100vw, 50vw" />
            <span className={`aud-shade ${i % 2 ? "t-plum" : "t-pine"}`} />
            <span className="aud-n mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="aud-v">{info.plural}</span>
            <span className="aud-open">
              <span className="d3">{info.plural}</span>
              <span className="aud-p">{info.blurb}</span>
              <SplitButtonStatic>Learn more</SplitButtonStatic>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
