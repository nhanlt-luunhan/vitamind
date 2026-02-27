"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/lib/blog/posts";

type BlogTocProps = {
  items: TocItem[];
};

const BlogToc = ({ items }: BlogTocProps) => {
  const steps = useMemo(() => items.filter((item) => item.level === 2), [items]);
  const [activeId, setActiveId] = useState<string | null>(() =>
    steps.length > 0 ? steps[0].id : null,
  );

  useEffect(() => {
    if (steps.length === 0) return;
    const headings = steps
      .map((step) => document.getElementById(step.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [steps]);

  if (steps.length === 0) return null;

  const activeIndex = steps.findIndex((step) => step.id === activeId);
  const progress =
    steps.length <= 1
      ? 100
      : Math.max(0, activeIndex) / Math.max(1, steps.length - 1) * 100;

  return (
    <aside className="blog-toc" aria-label="Mục lục">
      <div className="blog-toc__title">Mục lục</div>
      <div
        className="blog-toc__rail"
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
      >
        <ol className="blog-toc__list">
          {steps.map((item, index) => {
            const isActive = item.id === activeId;
            return (
              <li className={`blog-toc__item${isActive ? " is-active" : ""}`} key={item.id}>
                <Link
                  className="blog-toc__link"
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="blog-toc__index">{index + 1}</span>
                  <span className="blog-toc__text">{item.text}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
};

export { BlogToc };
