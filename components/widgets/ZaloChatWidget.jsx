"use client";

import { useEffect } from "react";
import Script from "next/script";

const ZALO_ROOT_SELECTOR =
  '.zalo-chat-widget, iframe[src*="zalo"], [class*="zalo-chat"], [id*="zalo-chat"]';

const clearZaloSurfaces = () => {
  const nodes = document.querySelectorAll(`${ZALO_ROOT_SELECTOR}, .zalo-chat-widget *`);

  nodes.forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.background = "transparent";
      node.style.backgroundColor = "transparent";
      node.style.boxShadow = "none";
      node.style.border = "0";
    }

    if (node instanceof HTMLIFrameElement) {
      node.style.background = "transparent";
      node.style.backgroundColor = "transparent";
      node.style.boxShadow = "none";
      node.style.border = "0";
    }
  });
};

const isVisibleNode = (node) => {
  if (!(node instanceof HTMLElement) && !(node instanceof HTMLIFrameElement)) {
    return false;
  }

  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }

  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const hasExpandedZaloPanel = () => {
  const nodes = document.querySelectorAll(ZALO_ROOT_SELECTOR);

  return Array.from(nodes).some((node) => {
    if (!(node instanceof HTMLElement) && !(node instanceof HTMLIFrameElement)) {
      return false;
    }

    if (!isVisibleNode(node)) return false;

    const rect = node.getBoundingClientRect();
    return rect.width >= 180 || rect.height >= 180;
  });
};

const closeZaloChat = () => {
  const closeSelectors = [
    '[class*="zalo-chat"] [aria-label*="Đóng"]',
    '[class*="zalo-chat"] [aria-label*="Close"]',
    '[class*="zalo-chat"] [title*="Đóng"]',
    '[class*="zalo-chat"] [title*="Close"]',
    '[class*="zalo-chat"] button[class*="close"]',
    '[id*="zalo-chat"] [aria-label*="Đóng"]',
    '[id*="zalo-chat"] [aria-label*="Close"]',
    '[id*="zalo-chat"] button[class*="close"]',
  ];

  for (const selector of closeSelectors) {
    const button = document.querySelector(selector);
    if (button instanceof HTMLElement && isVisibleNode(button)) {
      button.click();
      return;
    }
  }

  const largeNodes = document.querySelectorAll(ZALO_ROOT_SELECTOR);

  largeNodes.forEach((node) => {
    if (!(node instanceof HTMLElement) && !(node instanceof HTMLIFrameElement)) {
      return;
    }

    if (!isVisibleNode(node)) return;

    const rect = node.getBoundingClientRect();
    if (rect.width >= 180 || rect.height >= 180) {
      node.style.opacity = "0";
      node.style.pointerEvents = "none";
      node.style.visibility = "hidden";
    }
  });
};

const ZaloChatWidget = () => {
  useEffect(() => {
    clearZaloSurfaces();

    const observer = new MutationObserver(() => {
      clearZaloSurfaces();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    const handleKeyDown = () => {
      if (!hasExpandedZaloPanel()) return;
      closeZaloChat();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        className="zalo-chat-widget"
        data-oaid="161296678959895198"
        data-welcome-message="Rất vui khi được hỗ trợ bạn!"
        data-autopopup="0"
        data-width=""
        data-height=""
      />
      <Script
        id="zalo-sdk"
        src="https://sp.zalo.me/plugins/sdk.js"
        strategy="afterInteractive"
        onLoad={clearZaloSurfaces}
      />
    </>
  );
};

export { ZaloChatWidget };
