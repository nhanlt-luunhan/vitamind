"use client";

export function createBodyScrollLock() {
  return {
    count: 0,
    savedOverflow: "",
    savedPaddingRight: "",
  };
}

export function lockBodyScroll(lockState) {
  if (lockState.count > 0) {
    lockState.count += 1;
    return;
  }

  const html = document.documentElement;
  const body = document.body;

  // Measure scrollbar width before hiding it
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  lockState.savedOverflow = body.style.overflow;
  lockState.savedPaddingRight = body.style.paddingRight;

  // Compensate for scrollbar disappearing to prevent layout shift
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
    // Also compensate fixed header if it exists
    const header = document.querySelector("header");
    if (header) {
      header.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  body.style.overflow = "hidden";
  lockState.count += 1;
}

export function unlockBodyScroll(lockState) {
  if (lockState.count === 0) return;

  lockState.count -= 1;

  if (lockState.count === 0) {
    const body = document.body;
    const header = document.querySelector("header");

    body.style.overflow = lockState.savedOverflow;
    body.style.paddingRight = lockState.savedPaddingRight;

    if (header) {
      header.style.paddingRight = "";
    }
  }
}
