"use client";

import Script from "next/script";

const ZaloChatWidget = () => {
  return (
    <>
      <div
        className="zalo-chat-widget floating-actions__item floating-actions__item--zalo"
        data-oaid="161296678959895198"
        data-welcome-message="Rất vui khi được hỗ trợ bạn!"
        data-autopopup="0"
        data-width=""
        data-height=""
      />
      <Script
        src="https://sp.zalo.me/plugins/sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export { ZaloChatWidget };
