"use client";

import { useEffect } from "react";

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise<void>((resolve, reject) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!success) {
        reject(new Error("Copy failed"));
        return;
      }
      resolve();
    } catch (error) {
      reject(error as Error);
    }
  });
}

export function CodeCopy() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest<HTMLButtonElement>(".code-block__copy");
      if (!button) return;

      const encoded = button.dataset.code ?? "";
      const code = decodeURIComponent(encoded);
      const originalText = button.textContent ?? "Copy";

      copyText(code)
        .then(() => {
          button.textContent = "Copied";
          button.classList.add("is-copied");
          window.setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("is-copied");
          }, 1800);
        })
        .catch(() => {
          button.textContent = "Error";
          window.setTimeout(() => {
            button.textContent = originalText;
          }, 1800);
        });
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
}
