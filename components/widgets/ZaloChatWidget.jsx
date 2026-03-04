"use client";

import Script from "next/script";

const ZALO_OA_ID = "161296678959895198";

const ZaloChatWidget = () => {
  return (
    <>
      <div
        className="zalo-chat-widget"
        data-oaid={ZALO_OA_ID}
        data-welcome-message="Rất vui khi được hỗ trợ bạn!"
        data-autopopup="0"
        data-width="350"
        data-height="420"
      />

      <Script
        src="https://sp.zalo.me/plugins/sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export { ZaloChatWidget };
