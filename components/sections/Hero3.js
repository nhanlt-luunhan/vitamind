import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";

const Hero3 = () => {
  return (
    <>
      <div className="banner banner-home3 bg-gray-850">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="row">
                <div className="col-lg-6 pt-100">
                  <span className="text-sm-bold color-gray-600 wow animate__animated animate__fadeInUp">
                    Xin chào mọi người!
                  </span>
                  <h1 className="color-gray-50 mt-20 mb-20 wow animate__animated animate__fadeInUp">
                    Mình là Brian Clark
                  </h1>
                  <div className="row">
                    <div className="col-lg-9">
                      <p className="text-base color-gray-600 wow animate__animated animate__fadeInUp">
                        Tôi sử dụng chuyển động như một chiều thứ ba để đơn giản hóa trải nghiệm và
                        dẫn dắt tương tác. Tôi không thêm hiệu ứng chỉ để đẹp hơn, mà để tạo nên ý
                        nghĩa và nhịp điệu.
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
                  <div className="box-socials">
                    <Link className="bg-gray-800 hover-up" href="https://facebook.com">
                      <span className="fb" />
                    </Link>
                    <Link className="bg-gray-800 hover-up" href="https://instagram.com">
                      <span className="inst" />
                    </Link>
                    <Link className="bg-gray-800 hover-up" href="https://snapchat.com">
                      <span className="snap" />
                    </Link>
                    <Link className="bg-gray-800 hover-up" href="https://x.com">
                      <span className="tw" />
                    </Link>
                  </div>
                </div>
                <div className="col-lg-6 text-center">
                  <div className="banner-img no-bg">
                    <div className="banner-1 shape-1">
                      <Image
                        width={380}
                        height={453}
                        src="/assets/imgs/page/homepage3/banner-1.jpg"
                        alt="Genz"
                        priority
                        sizes="(max-width: 768px) 70vw, 380px"
                      />
                    </div>
                    <div className="banner-2 shape-2">
                      <Image
                        width={332}
                        height={285}
                        src="/assets/imgs/page/homepage3/banner-2.jpg"
                        alt="Genz"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Hero3 };
