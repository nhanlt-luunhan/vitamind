"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";

const LayoutShell = () => {
  const [openClass, setOpenClass] = useState("");

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

  return (
    <>
      {openClass && <div className="body-overlay-1" onClick={handleRemove} />}

      <Header handleOpen={handleOpen} handleRemove={handleRemove} openClass={openClass} />
      <MobileMenu openClass={openClass} />
    </>
  );
};

export { LayoutShell };
