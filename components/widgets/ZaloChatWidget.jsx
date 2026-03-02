"use client";

import Image from "next/image";

const ZALO_OA_ID = "161296678959895198";

const ZaloChatWidget = () => {
  const handleClick = (e) => {
    e.preventDefault();
    const isMobile = navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Mở app Zalo
      window.location.href = `https://zalo.me/${ZALO_OA_ID}`;
    } else {
      // Desktop: Mở khung chat popup (không chuyển tab mới)
      window.open(
        `https://chat.zalo.me/?phone=${ZALO_OA_ID}`,
        "zalo-chat",
        "width=400,height=600,left=100,top=100,resizable=yes,scrollbars=yes"
      );
    }
  };

  return (
    <a
      className="floating-actions__item floating-actions__item--zalo"
      href={`https://zalo.me/${ZALO_OA_ID}`}
      onClick={handleClick}
      aria-label="Chat qua Zalo"
      title="Chat qua Zalo"
    >
      <Image
        src="/assets/imgs/template/zalo-logo.png"
        alt="Zalo"
        width={54}
        height={54}
        priority={false}
      />
    </a>
  );
};

export { ZaloChatWidget };
