import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const MobileMenu = ({ openClass }) => {
  // State to track the active status and key
  const [isActive, setIsActive] = useState({
    status: false,
    key: "",
  });

  // Function to handle toggling the active status based on the given key
  const handleToggle = (key) => {
    // Check if the current key matches the active key in the state
    if (isActive.key === key) {
      // If the current key matches, set the active status to false
      setIsActive({
        status: false,
      });
    } else {
      // If the current key does not match, set the active status to true and update the key
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
                      <Link href="/">Trang chá»§</Link>
                    </li>
                    <li
                      className={isActive.key == 2 ? "has-children active" : "has-children"}
                      onClick={() => handleToggle(2)}
                    >
                      <span className="menu-expand">
                        <i className="fi-rr-caret-down"></i>
                      </span>
                      <Link href="/blog">ChuyÃªn má»¥c</Link>
                      <ul className={isActive.key == 2 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link href="/blog">ChuyÃªn má»¥c 1</Link>
                        </li>
                        <li>
                          <Link href="/blog">ChuyÃªn má»¥c 2</Link>
                        </li>
                        <li>
                          <Link href="/blog">ChuyÃªn má»¥c 3</Link>
                        </li>
                        <li>
                          <Link href="/blog">ChuyÃªn má»¥c 4</Link>
                        </li>
                        <li>
                          <Link href="/blog">ChuyÃªn má»¥c 5</Link>
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
                      <Link href="/blog">BÃ i viáº¿t</Link>
                      <ul className={isActive.key == 3 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link href="/category/raspberry-pi">Raspberry Pi</Link>
                        </li>
                        <li>
                          <Link href="/blog/2">BÃ i viáº¿t 2</Link>
                        </li>
                        <li>
                          <Link href="/blog/3">BÃ i viáº¿t 3</Link>
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
                        Dá»± Ã¡n
                      </Link>
                      <ul className={isActive.key == 5 ? "sub-menu d-block" : "sub-menu d-none"}>
                        <li>
                          <Link className="color-gray-500" href="/shop">
                            Dá»± Ã¡n cá»§a tÃ´i
                          </Link>
                        </li>
                        <li>
                          <Link className="color-gray-500" href="/shop">
                            Dá»± Ã¡n cá»§a tÃ´i 2
                          </Link>
                        </li>
                        <li>
                          <Link className="color-gray-500" href="/shop">
                            Chi tiáº¿t dá»± Ã¡n
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
                          <Link href="/blog">Giá»›i thiá»‡u</Link>
                        </li>
                        <li>
                          <Link href="/blog">BÃ i viáº¿t tÃ¡c giáº£</Link>
                        </li>
                        <li>
                          <Link href="/blog">LiÃªn há»‡</Link>
                        </li>
                        <li>
                          <Link href="/blog">Káº¿t quáº£ tÃ¬m kiáº¿m</Link>
                        </li>
                        <li>
                          <Link href="/login">ÄÄƒng nháº­p</Link>
                        </li>
                        <li>
                          <Link href="/login">ÄÄƒng kÃ½</Link>
                        </li>
                        <li>
                          <Link href="/admin">Quản trị</Link>
                        </li>
                        <li>
                          <Link href="/page-404">Trang 404</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Link href="/blog">LiÃªn há»‡</Link>
                    </li>
                  </ul>
                </nav>
              </div>
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
                        Xin chÃ o<span className="color-white"> Steven!</span>
                      </h6>
                      <p className="font-xs text-muted">Báº¡n cÃ³ 3 tin nháº¯n má»›i</p>
                    </div>
                  </div>
                </div>
                <ul className="mobile-menu">
                  <li>
                    <Link href="/account">Há»“ sÆ¡</Link>
                  </li>
                  <li>
                    <Link href="/account">BÃ i Ä‘Ã£ lÆ°u</Link>
                  </li>
                  <li>
                    <Link href="/account">ThÃªm bÃ i viáº¿t</Link>
                  </li>
                  <li>
                    <Link href="/account">Má»¥c yÃªu thÃ­ch</Link>
                  </li>
                  <li>
                    <Link href="/account">CÃ i Ä‘áº·t tÃ i khoáº£n</Link>
                  </li>
                  <li>
                    <Link href="/logout">ÄÄƒng xuáº¥t</Link>
                  </li>
                </ul>
              </div>
              <div className="site-copyright color-gray-400 mt-30">
                Báº£n quyá»n 2026 Â© Genz - Máº«u blog cÃ¡ nhÃ¢n.
                <br />
                Thiáº¿t káº¿ bá»Ÿi
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
