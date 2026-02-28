import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";
import { BrandLogo } from "@/components/layout/BrandLogo";

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

  const { user } = useUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const role =
    typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : null;
  const isAdmin = role === "admin" || primaryEmail === "nhanlt.luunhan@gmail.com";

  return (
    <>
      <div
        className={`mobile-header-active mobile-header-wrapper-style perfect-scrollbar bg-gray-900 ${openClass}`}
      >
        <div className="mobile-header-wrapper-inner">
          <div className="mobile-header-content-area">
            <div className="mobile-logo border-gray-800">
              <BrandLogo variant="dark" compact />
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
                            <SignOutButton redirectUrl="/">
                              <button type="button">Đăng xuất</button>
                            </SignOutButton>
                          </li>
                        </SignedIn>
                        {isAdmin ? (
                          <>
                            <li>
                              <Link href="/admin">Quản trị</Link>
                            </li>
                            <li>
                              <Link href="/admin/database">Cơ sở dữ liệu</Link>
                            </li>
                          </>
                        ) : null}
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
                        {user?.imageUrl ? (
                          <img width={48} height={48} src={user.imageUrl} alt="Vitamind" />
                        ) : (
                          <Image
                            width={48}
                            height={48}
                            src="/assets/imgs/template/LOGO FAVICON_LARGE.png"
                            alt="Vitamind"
                          />
                        )}
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
                    {isAdmin ? (
                      <>
                        <li>
                          <Link href="/admin">Trang quản trị</Link>
                        </li>
                        <li>
                          <Link href="/admin/database">Cơ sở dữ liệu</Link>
                        </li>
                      </>
                    ) : null}
                    <li>
                      <SignOutButton redirectUrl="/">
                        <button type="button">Đăng xuất</button>
                      </SignOutButton>
                    </li>
                  </ul>
                </div>
              </SignedIn>
              <div className="site-copyright color-gray-400 mt-30">
                Bản quyền 2026 © Vitamind.
                <br />
                Nền tảng nội dung và sản phẩm công nghệ thực tế.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { MobileMenu };
