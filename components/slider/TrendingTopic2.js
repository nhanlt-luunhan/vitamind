"use client";
import Link from "next/link";
import Image from "next/image";

import categories from "@/content/categoriesData";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
const swiperOptions = {
  modules: [Pagination, Navigation],
  slidesPerView: 4,
  spaceBetween: 30,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },

  // Navigation
  navigation: {
    prevEl: ".swiper-button-prev-style-2",
    nextEl: ".swiper-button-next-style-2",
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
      slidesPerView: 3,
      spaceBetween: 30,
    },
    1350: {
      slidesPerView: 4,
      spaceBetween: 30,
    },
  },
};

const TrendingTopic2 = () => {
  return (
    <>
      <div className="text-center mt-70">
        <h2 className="color-linear mb-10">Chủ đề thịnh hành</h2>
        <p className="text-lg color-gray-500">Khám phá những bài viết nổi bật ở mọi chủ đề</p>
      </div>
      <div className="mb-70 mt-70">
        <div className="box-swiper">
          <div className="swiper-container">
            <Swiper {...swiperOptions} className="swiper-wrapper">
              {categories.map((item, i) => (
                <SwiperSlide className="swiper-slide" key={i}>
                  <div className="card-style-1">
                    <Link href="/blog">
                      <div className="card-image">
                        <Image
                          width={246}
                          height={303}
                          src={`/assets/imgs/page/categories/${item.imgBig}`}
                          alt="Genz"
                        />
                        <div className="card-info">
                          <div className="info-bottom">
                            <h6 className="color-white mb-5">{item.title}</h6>
                            <p className="text-xs color-gray-500"> {item.article} Articles</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="swiper-button-prev swiper-button-prev-style-2" />
            <div className="swiper-button-next swiper-button-next-style-2" />
          </div>
        </div>
      </div>
    </>
  );
};

export { TrendingTopic2 };
