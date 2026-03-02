"use client";

export function createBodyScrollLock() {
  return { count: 0, scrollY: 0 };
}

export function lockBodyScroll(lockState) {
  if (lockState.count > 0) {
    lockState.count += 1;
    return;
  }
  lockState.count += 1;

  // Trên desktop (hover: hover), dropdown/search dùng fixed overlay
  // → không cần lock scroll, tránh vertical jump
  // Trên touch device, lock để tránh scroll-through mobile
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const body = document.body;
    lockState.scrollY = window.scrollY;
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
  }
}

export function unlockBodyScroll(lockState) {
  if (lockState.count === 0) return;
  lockState.count -= 1;
  if (lockState.count === 0) {
    const body = document.body;
    body.style.overflow = "";
    body.style.touchAction = "";
  }
}
