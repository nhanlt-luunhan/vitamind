import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-1 bg-gray-850 border-gray-800">
            <div className="row">
              <div className="col-lg-4 mb-30">
                <Link className="wow animate__animated animate__fadeInUp" href="/">
                  <Image width={116} height={36} src="/assets/imgs/template/logo.svg" alt="Genz" />
                </Link>
                <p className="mb-20 mt-20 text-sm color-gray-500 wow animate__animated animate__fadeInUp">
                  Một đoạn mô tả ngắn về blog, chia sẻ câu chuyện, cảm hứng và những bài viết mới
                  mỗi tuần.
                </p>
                <h6 className="color-white mb-5 wow animate__animated animate__fadeInUp">
                  Địa chỉ
                </h6>
                <p className="text-sm color-gray-500 wow animate__animated animate__fadeInUp">
                  123 Đường Chính
                  <br />
                  Hà Nội, Việt Nam
                </p>
              </div>
              <div className="col-lg-4 mb-30">
                <h6 className="text-lg mb-30 color-white wow animate__animated animate__fadeInUp">
                  Chuyên mục
                </h6>
                <div className="row">
                  <div className="col-6">
                    <ul className="menu-footer">
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Hành động
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Kinh doanh
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Phiêu lưu
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Canada
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Mỹ
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Khám phá
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col-6">
                    <ul className="menu-footer">
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Động vật
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Nha khoa
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Sinh học
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Thiết kế
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Bữa sáng
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Tráng miệng
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mb-30">
                <h4 className="text-lg mb-30 color-white wow animate__animated animate__fadeInUp">
                  Bản tin
                </h4>
                <p className="text-base color-gray-500 wow animate__animated animate__fadeInUp">
                  Đăng ký để nhận bài viết mới, câu chuyện truyền cảm hứng và tin tức ngành.
                </p>
                <div className="form-newsletters mt-15 wow animate__animated animate__fadeInUp">
                  <form action="/blog">
                    <div className="form-group">
                      <input
                        className="input-name border-gray-500"
                        type="text"
                        placeholder="Tên của bạn"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="input-email border-gray-500"
                        type="email"
                        placeholder="Địa chỉ email"
                      />
                    </div>
                    <div className="form-group mt-20">
                      <Button unstyled className="btn btn-linear hover-up" type="submit">
                        Theo dõi
                        <i className="fi-rr-arrow-small-right" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="footer-bottom border-gray-800">
              <div className="row">
                <div className="col-lg-5 text-center text-lg-start">
                  <p className="text-base color-white wow animate__animated animate__fadeIn">
                    © 2026 Thiết kế bởi
                    <Link className="copyright" href="http://alithemes.com" target="_blank">
                      {" "}
                      AliThemes.com
                    </Link>
                  </p>
                </div>
                <div className="col-lg-7 text-center text-lg-end">
                  <div className="box-socials">
                    <div
                      className="d-inline-block mr-30 wow animate__animated animate__fadeIn"
                      data-wow-delay=".0s"
                    >
                      <Link
                        className="icon-socials icon-twitter color-gray-500"
                        href="https://twitter.com"
                      >
                        Twitter
                      </Link>
                    </div>
                    <div
                      className="d-inline-block mr-30 wow animate__animated animate__fadeIn"
                      data-wow-delay=".2s"
                    >
                      <Link
                        className="icon-socials icon-linked color-gray-500"
                        href="https://www.linkedin.com"
                      >
                        LinkedIn
                      </Link>
                    </div>
                    <div
                      className="d-inline-block wow animate__animated animate__fadeIn"
                      data-wow-delay=".4s"
                    >
                      <Link
                        className="icon-socials icon-insta color-gray-500"
                        href="https://www.instagram.com"
                      >
                        Instagram
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export { Footer };
