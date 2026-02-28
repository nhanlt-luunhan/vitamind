"use client";

export function createBodyScrollLock() {
  return {
    count: 0,
    overflow: "",
    position: "",
    top: "",
    left: "",
    right: "",
    width: "",
    paddingRight: "",
    scrollY: 0,
  };
}

export function lockBodyScroll(lockState) {
  const body = document.body;

  if (lockState.count === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    lockState.scrollY = window.scrollY;
    lockState.overflow = body.style.overflow;
    lockState.position = body.style.position;
    lockState.top = body.style.top;
    lockState.left = body.style.left;
    lockState.right = body.style.right;
    lockState.width = body.style.width;
    lockState.paddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${lockState.scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.paddingRight =
      scrollbarWidth > 0 ? `${scrollbarWidth}px` : lockState.paddingRight;
  }

  lockState.count += 1;
}

export function unlockBodyScroll(lockState) {
  const body = document.body;

  if (lockState.count === 0) {
    return;
  }

  lockState.count -= 1;

  if (lockState.count === 0) {
    body.style.overflow = lockState.overflow;
    body.style.position = lockState.position;
    body.style.top = lockState.top;
    body.style.left = lockState.left;
    body.style.right = lockState.right;
    body.style.width = lockState.width;
    body.style.paddingRight = lockState.paddingRight;
    window.scrollTo(0, lockState.scrollY);
  }
}
