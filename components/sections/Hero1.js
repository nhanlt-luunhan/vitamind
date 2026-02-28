import Image from "next/image";
import { Button } from "@/components/ui";

const Hero1 = () => {
  return (
    <>
      <div className="banner">
        <div className="row align-items-end">
          <div className="col-lg-6 pt-100">
            <span className="text-sm-bold color-gray-600 wow animate__animated animate__fadeInUp">
              Chào mừng đến với Vitamind
            </span>
            <h1 className="color-gray-50 mt-20 mb-20 wow animate__animated animate__fadeInUp">
              Raspberry Pi, tự động hóa và những dự án làm được ngay
            </h1>
            <div className="row">
              <div className="col-lg-9">
                <p className="text-base color-gray-600 wow animate__animated animate__fadeInUp">
                  Vitamind tập trung vào hướng dẫn thực chiến, cấu hình gọn và sản phẩm phù hợp cho
                  người làm Raspberry Pi, Home Assistant, server mini và hệ thống cảm biến tại nhà.
                </p>
              </div>
            </div>
            <div className="box-subscriber mt-40 mb-50 wow animate__animated animate__fadeInUp">
              <div className="inner-subscriber bg-gray-800">
                <form className="d-flex" action="/blog">
                  <input
                    className="input-sybscriber"
                    type="text"
                    placeholder="Nhập địa chỉ email của bạn"
                  />
                  <Button unstyled className="btn btn-linear btn-arrow-right" type="submit">
                    Đăng ký
                    <i className="fi-rr-arrow-small-right" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <div className="banner-img position-relative wow animate__animated animate__fadeIn">
              <Image
                width={327}
                height={490}
                src="/assets/imgs/page/homepage1/banner.png"
                alt="Vitamind"
                priority
                sizes="(max-width: 768px) 70vw, 327px"
              />
              <div className="pattern-1">
                <Image
                  width={20}
                  height={20}
                  src="/assets/imgs/template/pattern-1.svg"
                  alt="Vitamind"
                />
              </div>
              <div className="pattern-2">
                <Image
                  width={30}
                  height={30}
                  src="/assets/imgs/template/pattern-2.svg"
                  alt="Vitamind"
                />
              </div>
              <div className="pattern-3">
                <Image
                  width={30}
                  height={30}
                  src="/assets/imgs/template/pattern-3.svg"
                  alt="Vitamind"
                />
              </div>
              <div className="pattern-4">
                <Image
                  width={30}
                  height={30}
                  src="/assets/imgs/template/pattern-4.svg"
                  alt="Vitamind"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Hero1 };
