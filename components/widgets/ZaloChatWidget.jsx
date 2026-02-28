"use client";

import Image from "next/image";

const ZaloChatWidget = () => {
  return (
    <a
      className="floating-actions__item floating-actions__item--zalo"
      href="https://zalo.me/161296678959895198"
      target="_blank"
      rel="noreferrer"
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
