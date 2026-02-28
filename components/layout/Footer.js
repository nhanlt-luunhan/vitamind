import Link from "next/link";
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/layout/BrandLogo";

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-1 bg-gray-850 border-gray-800">
            <div className="row">
              <div className="col-lg-4 mb-30">
                <div className="wow animate__animated animate__fadeInUp">
                  <BrandLogo variant="dark" />
                </div>
                <p className="mb-20 mt-20 text-sm color-gray-500 wow animate__animated animate__fadeInUp">
                  Vitamind chia sẻ bài viết thực tế về Raspberry Pi, tự động hóa gia đình, thiết bị
                  cảm biến và các dự án công nghệ có thể triển khai ngay.
                </p>
                <h6 className="color-white mb-5 wow animate__animated animate__fadeInUp">
                  Địa chỉ
                </h6>
                <p className="text-sm color-gray-500 wow animate__animated animate__fadeInUp">
                  Việt Nam
                  <br />
                  Làm việc linh hoạt từ xa
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
                          Raspberry Pi
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Tự động hóa
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Server mini
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Home Assistant
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Cảm biến
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Nhật ký kỹ thuật
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col-6">
                    <ul className="menu-footer">
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Bài viết mới
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Chuyên mục
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Sản phẩm
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/blog">
                          Trang tài khoản
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/sign-in">
                          Đăng nhập
                        </Link>
                      </li>
                      <li className="wow animate__animated animate__fadeInUp">
                        <Link className="color-gray-500" href="/sign-up">
                          Đăng ký
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
                    © 2026 Vitamind. Nội dung và giao diện được phát triển cho hệ thống riêng.
                  </p>
                </div>
                <div className="col-lg-7 text-center text-lg-end">
                  <div className="box-socials">
                    <div
                      className="d-inline-block mr-30 wow animate__animated animate__fadeIn"
                      data-wow-delay=".0s"
                    >
                      <Link className="footer-social-link color-gray-500" href="https://twitter.com">
                        <i className="ri-twitter-x-line" aria-hidden="true" />
                        <span>Twitter</span>
                      </Link>
                    </div>
                    <div
                      className="d-inline-block mr-30 wow animate__animated animate__fadeIn"
                      data-wow-delay=".2s"
                    >
                      <Link
                        className="footer-social-link color-gray-500"
                        href="https://www.linkedin.com"
                      >
                        <i className="ri-linkedin-line" aria-hidden="true" />
                        <span>LinkedIn</span>
                      </Link>
                    </div>
                    <div
                      className="d-inline-block wow animate__animated animate__fadeIn"
                      data-wow-delay=".4s"
                    >
                      <Link
                        className="footer-social-link color-gray-500"
                        href="https://www.instagram.com"
                      >
                        <i className="ri-instagram-line" aria-hidden="true" />
                        <span>Instagram</span>
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
