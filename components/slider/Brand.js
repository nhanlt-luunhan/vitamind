"use client";
import Link from "next/link";
import Image from "next/image";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
const swiperOptions = {
  modules: [Pagination, Navigation],
  slidesPerView: 5,
  spaceBetween: 30,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },

  // Navigation
  navigation: {
    prevEl: ".swiper-button-prev-style-3",
    nextEl: ".swiper-button-next-style-3",
  },

  //responsive
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 30,
    },
    575: {
      slidesPerView: 1,
      spaceBetween: 30,
    },
    767: {
      slidesPerView: 1,
      spaceBetween: 30,
    },
    991: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
    1199: {
      slidesPerView: 4,
      spaceBetween: 30,
    },
    1350: {
      slidesPerView: 5,
      spaceBetween: 30,
    },
  },
};

const Brand = () => {
  const data = [
    {
      img: "agon.svg",
    },
    {
      img: "mon.svg",
    },
    {
      img: "fig.svg",
    },
    {
      img: "flow.svg",
    },
    {
      img: "evara.svg",
    },
    {
      img: "agon.svg",
    },
    {
      img: "agon.svg",
    },
    {
      img: "mon.svg",
    },
    {
      img: "fig.svg",
    },
    {
      img: "flow.svg",
    },
    {
      img: "evara.svg",
    },
    {
      img: "agon.svg",
    },
  ];

  return (
    <>
      <Swiper {...swiperOptions} className="swiper-wrapper pt-5">
        {data.map((item, i) => (
          <SwiperSlide className="swiper-slide" key={i}>
            <Link href="/shop">
              <Image
                width={205}
                height={48}
                src={`/assets/imgs/page/homepage3/${item.img}`}
                alt="Genz"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export { Brand };
