"use client";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";

const swiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
};

const ImageSlider = () => {
  const data = [
    {
      img: "portfolio-1.png",
    },
    {
      img: "portfolio-1-1.png",
    },
    {
      img: "portfolio-1-2.png",
    },
    {
      img: "portfolio-1-3.png",
    },
  ];

  return (
    <>
      <Swiper {...swiperOptions} className="swiper-wrapper pt-5">
        {data.map((item, i) => (
          <SwiperSlide className="swiper-slide" key={i}>
            <Image
              width={1075}
              height={485}
              src={`/assets/imgs/page/portfolio/${item.img}`}
              alt="Genz"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export { ImageSlider };
