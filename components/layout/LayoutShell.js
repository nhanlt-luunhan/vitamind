"use client";

import { useEffect, useRef, useState } from "react";
import { createBodyScrollLock, lockBodyScroll, unlockBodyScroll } from "@/lib/dom/bodyScrollLock";
import { Header } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";

const LayoutShell = () => {
  const [openClass, setOpenClass] = useState("");
  const bodyScrollLockRef = useRef(createBodyScrollLock());

  const handleOpen = () => {
    document.body.classList.add("mobile-menu-active");
    setOpenClass("sidebar-visible");
  };

  const handleRemove = () => {
    if (openClass === "sidebar-visible") {
      document.body.classList.remove("mobile-menu-active");
      setOpenClass("");
    }
  };

  useEffect(() => {
    if (!openClass) return undefined;

    lockBodyScroll(bodyScrollLockRef.current);

    return () => {
      unlockBodyScroll(bodyScrollLockRef.current);
    };
  }, [openClass]);

  return (
    <>
      {openClass && <div className="body-overlay-1" onClick={handleRemove} />}

      <Header handleOpen={handleOpen} handleRemove={handleRemove} openClass={openClass} />
      <MobileMenu openClass={openClass} />
    </>
  );
};

export { LayoutShell };
