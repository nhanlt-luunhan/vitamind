import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const MobileMenu = ({ openClass }) => {
  const [isActive, setIsActive] = useState({
    status: false,
    key: "",
  });

  const handleToggle = (key) => {
    if (isActive.key === key) {
      setIsActive({
        status: false,
      });
    } else {
      setIsActive({
        status: true,
        key,
      });
    }
  };

  return (
    <>
      <div
        className={`mobile-header-active mobile-header-wrapper-style perfect-scrollbar bg-gray-900 ${openClass}`}
      >
        <div className="mobile-header-wrapper-inner">
          <div className="mobile-header-content-area">
            <div className="mobile-logo border-gray-800">
              <Link className="d-flex" href="/">
                <Image
                  width={116}
                  height={36}
                  className="logo-night"
                  alt="GenZ"
                  src="/assets/imgs/template/logo.svg"
                />
                <Image
                  width={116}
                  height={36}
                  className="d-none logo-day"
                  alt="GenZ"
                  src="/assets/imgs/template/logo-day.svg"
                />
              </Link>
            </div>
            <div className="perfect-scroll">
              <div className="mobile-menu-wrap mobile-header-border">
                <nav className="mt-15">
                  <ul className="mobile-menu font-heading">
                    <li>
                      <Link href="/">Trang chủ</Link>
                    </li>
                    <li
                      className={isActive.key == 2 ? "has-children active" : "has-children"}
                      onClick={() => handleToggle(2)}
                    >
                      <span className="menu-expand">
                        <i className="fi-rr-caret-down"></i>
                      </span>
                      <Link href="/blog">Chuyên mục</Link>
                      <ul className={isActive.key == 2 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link href="/blog">Chuyên mục 1</Link>
                        </li>
                        <li>
                          <Link href="/blog">Chuyên mục 2</Link>
                        </li>
                        <li>
                          <Link href="/blog">Chuyên mục 3</Link>
                        </li>
                        <li>
                          <Link href="/blog">Chuyên mục 4</Link>
                        </li>
                        <li>
                          <Link href="/blog">Chuyên mục 5</Link>
                        </li>
                      </ul>
                    </li>
                    <li
                      className={isActive.key == 3 ? "has-children active" : "has-children"}
                      onClick={() => handleToggle(3)}
                    >
                      <span className="menu-expand">
                        <i className="fi-rr-caret-down"></i>
                      </span>
                      <Link href="/blog">Bài viết</Link>
                      <ul className={isActive.key == 3 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link href="/category/raspberry-pi">Raspberry Pi</Link>
                        </li>
                        <li>
                          <Link href="/blog/2">Bài viết 2</Link>
                        </li>
                        <li>
                          <Link href="/blog/3">Bài viết 3</Link>
                        </li>
                      </ul>
                    </li>
                    <li
                      className={isActive.key == 5 ? "has-children active" : "has-children"}
                      onClick={() => handleToggle(5)}
                    >
                      <span className="menu-expand">
                        <i className="fi-rr-caret-down"></i>
                      </span>
                      <Link className="color-gray-500" href="/shop">
                        Dự án
                      </Link>
                      <ul className={isActive.key == 5 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link className="color-gray-500" href="/shop">
                            Dự án của tôi
                          </Link>
                        </li>
                        <li>
                          <Link className="color-gray-500" href="/shop">
                            Dự án của tôi 2
                          </Link>
                        </li>
                        <li>
                          <Link className="color-gray-500" href="/shop">
                            Chi tiết dự án
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li
                      className={isActive.key == 4 ? "has-children active" : "has-children"}
                      onClick={() => handleToggle(4)}
                    >
                      <span className="menu-expand">
                        <i className="fi-rr-caret-down"></i>
                      </span>
                      <Link href="/blog">Trang</Link>
                      <ul className={isActive.key == 4 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link href="/blog">Giới thiệu</Link>
                        </li>
                        <li>
                          <Link href="/blog">Bài viết tác giả</Link>
                        </li>
                        <li>
                          <Link href="/blog">Liên hệ</Link>
                        </li>
                        <li>
                          <Link href="/blog">Kết quả tìm kiếm</Link>
                        </li>
                        <SignedOut>
                          <li>
                            <Link href="/sign-in">Đăng nhập</Link>
                          </li>
                          <li>
                            <Link href="/sign-up">Đăng ký</Link>
                          </li>
                        </SignedOut>
                        <SignedIn>
                          <li>
                            <Link href="/account">Tài khoản</Link>
                          </li>
                          <li>
                            <Link href="/logout">Đăng xuất</Link>
                          </li>
                        </SignedIn>
                        <li>
                          <Link href="/admin">Quản trị</Link>
                        </li>
                        <li>
                          <Link href="/page-404">Trang 404</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Link href="/blog">Liên hệ</Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <SignedIn>
                <div className="mobile-account border-gray-800">
                  <div className="mobile-header-top bg-gray-900">
                    <div className="user-account">
                      <Link href="/account">
                        <Image
                          width={48}
                          height={48}
                          src="/assets/imgs/template/ava.jpg"
                          alt="GenZ"
                        />
                      </Link>
                      <div className="content">
                        <h6 className="user-name color-white">
                          Xin chào<span className="color-white">!</span>
                        </h6>
                        <p className="font-xs text-muted">Quản lý tài khoản của bạn</p>
                      </div>
                    </div>
                  </div>
                  <ul className="mobile-menu">
                    <li>
                      <Link href="/account">Hồ sơ</Link>
                    </li>
                    <li>
                      <Link href="/account">Bài đã lưu</Link>
                    </li>
                    <li>
                      <Link href="/account">Thêm bài viết</Link>
                    </li>
                    <li>
                      <Link href="/account">Mục yêu thích</Link>
                    </li>
                    <li>
                      <Link href="/account">Cài đặt tài khoản</Link>
                    </li>
                    <li>
                      <Link href="/logout">Đăng xuất</Link>
                    </li>
                  </ul>
                </div>
              </SignedIn>
              <div className="site-copyright color-gray-400 mt-30">
                Bản quyền 2026 © Genz - Mẫu blog cá nhân.
                <br />
                Thiết kế bởi
                <Link href="http://alithemes.com" target="_blank">
                  &nbsp; AliThemes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { MobileMenu };
