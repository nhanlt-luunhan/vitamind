"use client";

import { useEffect, useRef } from "react";

export function CursorDot() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: -9999, y: -9999, visible: false });
  const ringPosRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const ringEl = ringRef.current;
    if (!ringEl) return;

    const animate = () => {
      const { x, y, visible } = targetRef.current;
      const ringPos = ringPosRef.current;

      ringPos.x += (x - ringPos.x) * 0.28;
      ringPos.y += (y - ringPos.y) * 0.28;

      ringEl.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      ringEl.style.opacity = visible ? "1" : "0";

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const onMove = (event: MouseEvent) => {
      targetRef.current.x = event.clientX - 13;
      targetRef.current.y = event.clientY - 13;
      targetRef.current.visible = true;
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(animate);
      }
    };

    const onLeave = () => {
      targetRef.current.visible = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return <div ref={ringRef} className="cursor-ring" aria-hidden="true" />;
}
