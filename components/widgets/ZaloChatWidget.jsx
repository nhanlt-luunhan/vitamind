"use client";

import { useEffect } from "react";
import Script from "next/script";

const ZALO_STORAGE_KEY = "vitamind:zalo-open";
const ZALO_ROOT_SELECTOR =
  '.zalo-chat-widget, iframe[src*="zalo"], [class*="zalo-chat"], [id*="zalo-chat"]';

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

const isExpandedNode = (node) => {
  if (!isVisibleNode(node)) return false;
  const rect = node.getBoundingClientRect();
  return rect.width >= 260 || rect.height >= 260;
};

const isLauncherNode = (node) => {
  if (!isVisibleNode(node)) return false;
  const rect = node.getBoundingClientRect();
  return rect.width <= 120 && rect.height <= 120;
};

const clearZaloSurfaces = () => {
  const nodes = document.querySelectorAll(
    '.zalo-chat-widget, iframe[src*="zalo"], [class*="zalo-chat"], [id*="zalo-chat"]',
  );

  nodes.forEach((node) => {
    if (node instanceof HTMLElement || node instanceof HTMLIFrameElement) {
      node.style.background = "transparent";
      node.style.backgroundColor = "transparent";
      node.style.boxShadow = "none";
      node.style.border = "0";
    }
  });
};

const hasExpandedZaloPanel = () => {
  const nodes = document.querySelectorAll(ZALO_ROOT_SELECTOR);
  return Array.from(nodes).some((node) => isExpandedNode(node));
};

const getLauncherNode = () => {
  const nodes = Array.from(document.querySelectorAll(ZALO_ROOT_SELECTOR)).filter((node) =>
    isLauncherNode(node),
  );

  return nodes[0] instanceof HTMLElement || nodes[0] instanceof HTMLIFrameElement ? nodes[0] : null;
};

const rememberOpenState = () => {
  window.localStorage.setItem(ZALO_STORAGE_KEY, "1");
};

const shouldKeepOpen = () => window.localStorage.getItem(ZALO_STORAGE_KEY) === "1";

const ensureZaloOpen = () => {
  if (!shouldKeepOpen() || hasExpandedZaloPanel()) return;

  const launcher = getLauncherNode();
  if (launcher instanceof HTMLElement || launcher instanceof HTMLIFrameElement) {
    launcher.click();
  }
};

const scheduleEnsureZaloOpen = () => {
  if (!shouldKeepOpen()) return;

  let attempts = 0;
  const tick = () => {
    clearZaloSurfaces();
    ensureZaloOpen();

    if (hasExpandedZaloPanel() || attempts >= 6) return;

    attempts += 1;
    window.setTimeout(tick, 450);
  };

  window.setTimeout(tick, 180);
};

const ZaloChatWidget = () => {
  useEffect(() => {
    clearZaloSurfaces();
    scheduleEnsureZaloOpen();

    const observer = new MutationObserver(() => {
      clearZaloSurfaces();

      if (hasExpandedZaloPanel()) {
        rememberOpenState();
        return;
      }

      scheduleEnsureZaloOpen();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
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
        onLoad={() => {
          clearZaloSurfaces();
          scheduleEnsureZaloOpen();
        }}
      />
    </>
  );
};

export { ZaloChatWidget };
