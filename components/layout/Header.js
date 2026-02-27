"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThemeSwitch } from "@/components/elements/SwitchButton";
import { ButtonClient } from "@/components/ui";

const Header = ({ handleOpen, handleRemove, openClass }) => {
  // State to keep track of the scroll position
  const [scroll, setScroll] = useState(0);

  // State to represent whether something is toggled or not
  const [isToggled, setToggled] = useState(false);

  // Function to toggle the value of 'isToggled'
  const toggleTrueFalse = () => setToggled(!isToggled);

  // Effect hook to add a scroll event listener
  useEffect(() => {
    // Callback function to handle the scroll event
    const handleScroll = () => {
      // Check if the current scroll position is greater than 100 pixels
      const scrollCheck = window.scrollY > 100;
      setScroll(scrollCheck);
    };

    // Add the 'handleScroll' function as a scroll event listener
    document.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={scroll ? "header sticky-bar bg-gray-900 stick" : "header sticky-bar bg-gray-900"}
      >
        <div className="container">
          <div className="main-header">
            <div className="header-logo">
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
            <div className="header-nav">
              <nav className="nav-main-menu d-none d-xl-block">
                <ul className="main-menu">
                  <li>
                    <Link className="active" href="/">
                      Trang chủ
                    </Link>
                  </li>
                  <li className="has-children">
                    <Link className="color-gray-500" href="/blog">
                      Về tôi
                    </Link>
                    <ul className="sub-menu">
                      <li>
                        <Link className="color-gray-500" href="/shop">
                          Dự án của tôi
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/shop">
                          Chi tiết dự án
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="has-children">
                    <Link className="color-gray-500" href="/blog">
                      Chuyên mục
                    </Link>
                    <ul className="sub-menu two-col">
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Chuyên mục 1
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Chuyên mục 2
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Chuyên mục 3
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Chuyên mục 4
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Chuyên mục 5
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="has-children">
                    <Link className="color-gray-500" href="/blog">
                      Bài viết
                    </Link>
                    <ul className="sub-menu two-col">
                      <li>
                        <Link className="color-gray-500" href="/category/raspberry-pi">
                          Raspberry Pi
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog/2">
                          Bài viết 2
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog/3">
                          Bài viết 3
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="has-children">
                    <Link className="color-gray-500" href="/blog">
                      Trang
                    </Link>
                    <ul className="sub-menu two-col">
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Giới thiệu
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Bài viết tác giả
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Liên hệ
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/blog">
                          Kết quả tìm kiếm
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/login">
                          Đăng nhập
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/login">
                          Đăng ký
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/admin">
                          Quản trị
                        </Link>
                      </li>
                      <li>
                        <Link className="color-gray-500" href="/page-404">
                          Trang 404
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Link className="color-gray-500" href="/blog">
                      Liên hệ
                    </Link>
                  </li>
                </ul>
              </nav>
              <div
                className={`burger-icon burger-icon-white ${openClass && "burger-close"}`}
                onClick={() => {
                  handleOpen();
                  handleRemove();
                }}
              >
                <span className="burger-icon-top" />
                <span className="burger-icon-mid" />
                <span className="burger-icon-bottom" />
              </div>
            </div>
            <div className="header-right text-end">
              <ButtonClient
                unstyled
                className="btn btn-search"
                type="button"
                onClick={toggleTrueFalse}
                aria-label="Tìm kiếm"
              />
              <ThemeSwitch />
              <div className={isToggled ? "form-search p-20 d-block" : " form-search p-20 d-none"}>
                <form action="/blog">
                  <input className="form-control" type="text" placeholder="Tìm kiếm" />
                  <input className="btn-search-2" />
                </form>
                <div className="popular-keywords text-start mt-20">
                  <p className="mb-10 color-white">Thẻ phổ biến:</p>
                  <Link className="color-gray-600 mr-10 font-xs" href="/blog">
                    # Du lịch,
                  </Link>
                  <Link className="color-gray-600 mr-10 font-xs" href="/blog">
                    # Công nghệ,
                  </Link>
                  <Link className="color-gray-600 mr-10 font-xs" href="/blog">
                    # Phim
                  </Link>
                  <Link className="color-gray-600 mr-10 font-xs" href="/blog">
                    # Phong cách sống
                  </Link>
                  <Link className="color-gray-600 mr-10 font-xs" href="/blog">
                    # Thể thao
                  </Link>
                </div>
              </div>
              <ButtonClient
                asChild
                unstyled
                className="btn btn-linear d-none d-sm-inline-block hover-up hover-shadow"
              >
                <Link href="/account" prefetch={false}>
                  Tài khoản
                </Link>
              </ButtonClient>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export { Header };
