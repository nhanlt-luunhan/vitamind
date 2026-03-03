"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/components/auth/useSessionUser";
import { createBodyScrollLock, lockBodyScroll, unlockBodyScroll } from "@/lib/dom/bodyScrollLock";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import styles from "./Header.module.css";

const desktopNavItems = [
  { type: "link", label: "Trang chủ", href: "/" },
  {
    type: "menu",
    key: "about",
    label: "Về tôi",
    sections: [
      {
        title: "Khám phá nhanh",
        featured: true,
        links: [
          { href: "/blog", label: "Hồ sơ cá nhân", emphasis: true },
          { href: "/shop", label: "Dự án của tôi", emphasis: true },
          { href: "/shop", label: "Chi tiết dự án" },
        ],
      },
      {
        title: "Điểm vào",
        links: [
          { href: "/", label: "Trang chủ", emphasis: true },
          { href: "/blog", label: "Bài viết" },
          { href: "/shop", label: "Sản phẩm" },
        ],
      },
      {
        title: "Liên kết",
        links: [
          { href: "/sign-in", label: "Đăng nhập", emphasis: true },
          { href: "/sign-up", label: "Đăng ký", emphasis: true },
          { href: "/blog", label: "Liên hệ" },
        ],
      },
    ],
  },
  {
    type: "menu",
    key: "categories",
    label: "Chuyên mục",
    sections: [
      {
        title: "Chuyên mục nổi bật",
        featured: true,
        links: [
          { href: "/category/raspberry-pi", label: "Raspberry Pi", emphasis: true },
          { href: "/blog", label: "Tự động hóa gia đình", emphasis: true },
          { href: "/shop", label: "Thiết bị và cảm biến" },
        ],
      },
      {
        title: "Theo nội dung",
        links: [
          { href: "/blog", label: "Hướng dẫn nhanh", emphasis: true },
          { href: "/blog", label: "Server mini" },
          { href: "/blog", label: "Home Assistant" },
        ],
      },
      {
        title: "Theo hành động",
        links: [
          { href: "/shop", label: "Chọn sản phẩm" },
          { href: "/blog", label: "Đọc case study" },
          { href: "/category/raspberry-pi", label: "Xem toàn bộ" },
        ],
      },
    ],
  },
  {
    type: "menu",
    key: "posts",
    label: "Bài viết",
    sections: [
      {
        title: "Mới đăng",
        featured: true,
        links: [
          {
            href: "/blog/home-assistant-tren-raspberry-pi-cai-nhanh-gon-dep",
            label: "Home Assistant trên Raspberry Pi",
            emphasis: true,
          },
          {
            href: "/blog/raspberry-pi-os-cai-dat-chuan-cho-nguoi-moi-bat-dau",
            label: "Raspberry Pi OS cho người mới",
            emphasis: true,
          },
          {
            href: "/blog/bien-raspberry-pi-thanh-server-mini-cho-gia-dinh",
            label: "Biến Raspberry Pi thành server mini",
          },
        ],
      },
      {
        title: "Thư viện",
        links: [
          { href: "/blog", label: "Toàn bộ bài viết", emphasis: true },
          { href: "/category/raspberry-pi", label: "Theo chuyên mục" },
          { href: "/shop", label: "Gắn với sản phẩm" },
        ],
      },
      {
        title: "Tác vụ nhanh",
        links: [
          { href: "/blog", label: "Bài viết tác giả" },
          { href: "/blog", label: "Tìm bài theo chủ đề" },
          { href: "/blog", label: "Lưu để đọc sau" },
        ],
      },
    ],
  },
  {
    type: "menu",
    key: "pages",
    label: "Trang",
    sections: [
      {
        title: "Trang hệ thống",
        featured: true,
        links: [
          { href: "/sign-in", label: "Đăng nhập", emphasis: true },
          { href: "/sign-up", label: "Đăng ký", emphasis: true },
          { href: "/account", label: "Tài khoản" },
        ],
      },
      {
        title: "Điều hướng",
        links: [
          { href: "/", label: "Trang chủ" },
          { href: "/shop", label: "Cửa hàng" },
          { href: "/blog", label: "Bài viết" },
        ],
      },
      {
        title: "Khác",
        links: [
          { href: "/not-authorized", label: "Không đủ quyền" },
          { href: "/page-404", label: "Trang 404" },
          { href: "/admin", label: "Quản trị" },
        ],
      },
    ],
  },
  { type: "link", label: "Liên hệ", href: "/blog" },
];

const quickLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/blog", label: "Bài viết" },
  { href: "/shop", label: "Sản phẩm" },
  { href: "/category/raspberry-pi", label: "Chuyên mục Raspberry Pi" },
];

const suggestedTopics = [
  { href: "/category/raspberry-pi", label: "Raspberry Pi" },
  { href: "/blog", label: "Tự động hóa" },
  { href: "/shop", label: "Thiết bị" },
  { href: "/blog", label: "Dự án mới" },
];

const createEmptySearchResults = () => ({
  pages: [],
  categories: [],
  posts: [],
  products: [],
});

const Header = ({ handleOpen, handleRemove, openClass }) => {
  const router = useRouter();
  const { isLoaded: isAuthLoaded, isSignedIn, user } = useSessionUser();
  const [hasMounted, setHasMounted] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [overlayTop, setOverlayTop] = useState(78);
  const [isSearchMounted, setSearchMounted] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState(createEmptySearchResults);
  const [isSearching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeNavKey, setActiveNavKey] = useState(null);
  const [isNavMounted, setNavMounted] = useState(false);
  const [isNavOpen, setNavOpen] = useState(false);
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const navRef = useRef(null);
  const searchInputRef = useRef(null);
  const closeTimerRef = useRef(null);
  const navCloseTimerRef = useRef(null);
  const bodyScrollLockRef = useRef(createBodyScrollLock());

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const openSearch = () => {
    if (isNavMounted) {
      closeNavPanel();
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSearchMounted(true);
    window.requestAnimationFrame(() => {
      setSearchOpen(true);
    });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setSearchMounted(false);
    }, 240);
  };

  const toggleSearch = () => {
    if (isSearchMounted) {
      closeSearch();
      return;
    }
    openSearch();
  };

  const openNavPanel = (key) => {
    if (isSearchMounted) {
      closeSearch();
    }
    if (navCloseTimerRef.current) {
      window.clearTimeout(navCloseTimerRef.current);
      navCloseTimerRef.current = null;
    }
    setActiveNavKey(key);
    setNavMounted(true);
    window.requestAnimationFrame(() => {
      setNavOpen(true);
    });
  };

  const closeNavPanel = () => {
    setNavOpen(false);
    navCloseTimerRef.current = window.setTimeout(() => {
      setNavMounted(false);
      setActiveNavKey(null);
    }, 220);
  };

  const scheduleCloseNavPanel = () => {
    if (navCloseTimerRef.current) {
      window.clearTimeout(navCloseTimerRef.current);
    }
    navCloseTimerRef.current = window.setTimeout(() => {
      closeNavPanel();
    }, 120);
  };

  const toggleNavPanel = (key) => {
    if (isNavMounted && activeNavKey === key) {
      closeNavPanel();
      return;
    }
    openNavPanel(key);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 100);
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateOverlayTop = () => {
      if (!headerRef.current) return;
      const rect = headerRef.current.getBoundingClientRect();
      setOverlayTop(Math.max(Math.round(rect.bottom), 64));
    };

    updateOverlayTop();
    window.addEventListener("resize", updateOverlayTop);
    window.addEventListener("scroll", updateOverlayTop, { passive: true });

    return () => {
      window.removeEventListener("resize", updateOverlayTop);
      window.removeEventListener("scroll", updateOverlayTop);
    };
  }, []);

  useEffect(() => {
    if (!isSearchMounted) return undefined;

    const handleClickOutside = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        closeSearch();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus({ preventScroll: true });
    }, 120);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchMounted]);

  useEffect(() => {
    if (!isSearchMounted && !isNavMounted) return undefined;

    lockBodyScroll(bodyScrollLockRef.current);

    return () => {
      unlockBodyScroll(bodyScrollLockRef.current);
    };
  }, [isNavMounted, isSearchMounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (navCloseTimerRef.current) {
        window.clearTimeout(navCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isNavMounted) return undefined;

    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeNavPanel();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeNavPanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavMounted]);

  useEffect(() => {
    const query = searchValue.trim();
    if (!isSearchMounted || query.length < 2) {
      setSearching(false);
      setSearchError("");
      setSearchResults(createEmptySearchResults());
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError("");
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Không tải được dữ liệu tìm kiếm.");
        }

        const data = await response.json();
        setSearchResults({
          pages: data.pages ?? [],
          categories: data.categories ?? [],
          posts: data.posts ?? [],
          products: data.products ?? [],
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearchError("Không thể tải kết quả tìm kiếm lúc này.");
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [isSearchMounted, searchValue]);

  const searchQuery = searchValue.trim();
  const searchGroups = [
    { key: "pages", label: "Trang thông tin", items: searchResults.pages },
    { key: "categories", label: "Chuyên mục", items: searchResults.categories },
    { key: "posts", label: "Bài viết", items: searchResults.posts },
    { key: "products", label: "Sản phẩm", items: searchResults.products },
  ].filter((group) => group.items.length > 0);

  const firstSearchResult = searchGroups.flatMap((group) => group.items)[0] ?? null;

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (!firstSearchResult) return;
    event.preventDefault();
    closeSearch();
    router.push(firstSearchResult.href);
  };

  const activeNavItem =
    desktopNavItems.find((item) => item.type === "menu" && item.key === activeNavKey) ?? null;
  const isUniformPostsPanel = activeNavItem?.key === "posts";
  const overlayStyle = { top: `${overlayTop}px` };

  return (
    <>
      <header
        ref={headerRef}
        className={scroll ? "header sticky-bar bg-gray-900 stick" : "header sticky-bar bg-gray-900"}
        style={{ zIndex: 92 }}
      >
        <div className="container">
          <div className="main-header">
            <div className="header-logo">
              <BrandLogo />
            </div>
            <div className="header-nav">
              <nav
                className={`nav-main-menu d-none d-xl-block ${styles.desktopNavWrap}`}
                ref={navRef}
                onMouseEnter={() => {
                  if (navCloseTimerRef.current) {
                    window.clearTimeout(navCloseTimerRef.current);
                    navCloseTimerRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  if (isNavMounted) {
                    scheduleCloseNavPanel();
                  }
                }}
              >
                <div className={styles.desktopNav}>
                  {desktopNavItems.map((item) =>
                    item.type === "link" ? (
                      <Link key={item.label} href={item.href} className={styles.desktopNavLink}>
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        key={item.key}
                        type="button"
                        className={`${styles.desktopNavButton} ${activeNavKey === item.key && isNavOpen ? styles.desktopNavButtonActive : ""}`}
                        onClick={() => toggleNavPanel(item.key)}
                        onMouseEnter={() => {
                          openNavPanel(item.key);
                        }}
                        aria-expanded={activeNavKey === item.key && isNavOpen}
                      >
                        <span>{item.label}</span>
                      </button>
                    ),
                  )}
                </div>

                {isNavMounted && activeNavItem ? (
                  <>
                    <button
                      type="button"
                      className={`${styles.navOverlay} ${isNavOpen ? styles.navOverlayOpen : ""}`}
                      style={overlayStyle}
                      aria-label="Đóng menu điều hướng"
                      onClick={closeNavPanel}
                    />
                    <div
                      className={`${styles.navPanel} ${isNavOpen ? styles.navPanelOpen : ""}`}
                      style={overlayStyle}
                      onMouseEnter={() => {
                        if (navCloseTimerRef.current) {
                          window.clearTimeout(navCloseTimerRef.current);
                          navCloseTimerRef.current = null;
                        }
                      }}
                      onMouseLeave={scheduleCloseNavPanel}
                    >
                      <div className={styles.navPanelInner}>
                        {activeNavItem.sections.map((section, index) => (
                          <section
                            key={`${activeNavItem.key}-${section.title}`}
                            className={`${styles.navColumn} ${section.featured && !isUniformPostsPanel ? styles.navColumnFeatured : ""}`}
                          >
                            <p className={styles.navColumnLabel}>{section.title}</p>
                            <ul className={styles.navColumnList}>
                              {section.links.map((link) => (
                                <li key={link.href + link.label}>
                                  <Link
                                    href={link.href}
                                    className={`${styles.navColumnLink} ${section.featured && !isUniformPostsPanel ? styles.navColumnLinkFeatured : ""} ${link.emphasis && !isUniformPostsPanel ? styles.navColumnLinkStrong : ""}`}
                                    title={link.label}
                                    onClick={closeNavPanel}
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
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
            <div className={`header-right text-end ${styles.right}`}>
              <div className={styles.controls}>
                <div className={styles.searchShell} ref={searchRef}>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${isSearchOpen ? styles.iconButtonActive : ""}`}
                    onClick={toggleSearch}
                    aria-expanded={isSearchOpen}
                    aria-label="Mở tìm kiếm"
                  >
                    <svg
                      className={styles.icon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </button>
                  {isSearchMounted ? (
                    <>
                      <button
                        type="button"
                        className={`${styles.searchOverlay} ${isSearchOpen ? styles.searchOverlayOpen : ""}`}
                        style={overlayStyle}
                        aria-label="Đóng tìm kiếm"
                        onClick={closeSearch}
                      />
                      <div
                        className={`${styles.searchPanel} ${isSearchOpen ? styles.searchPanelOpen : ""}`}
                        style={overlayStyle}
                      >
                        <div className={styles.searchPanelInner}>
                          <div className={styles.searchBar}>
                            <span className={styles.searchBarIcon}>
                              <svg
                                className={styles.icon}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                              </svg>
                            </span>
                            <div className={styles.searchField}>
                              <input
                                ref={searchInputRef}
                                className={styles.searchInput}
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Tìm kiếm thông tin"
                                autoComplete="off"
                              />
                            </div>
                            <button
                              type="button"
                              className={styles.searchClose}
                              onClick={closeSearch}
                              aria-label="Đóng tìm kiếm"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M6 6l12 12" />
                                <path d="M18 6 6 18" />
                              </svg>
                            </button>
                          </div>

                          {searchQuery.length >= 2 ? (
                            <div className={styles.searchResults}>
                              {isSearching ? (
                                <div className={styles.searchState}>
                                  Đang tìm kết quả trên toàn bộ nội dung công khai...
                                </div>
                              ) : searchError ? (
                                <div className={styles.searchState}>{searchError}</div>
                              ) : searchGroups.length > 0 ? (
                                <div className={styles.searchMeta}>
                                  {searchGroups.map((group) => (
                                    <section className={styles.searchSection} key={group.key}>
                                      <p className={styles.searchLabel}>
                                        {group.label}
                                        <span className={styles.searchCount}>
                                          {group.items.length}
                                        </span>
                                      </p>
                                      <ul className={styles.searchResultList}>
                                        {group.items.map((item) => (
                                          <li key={`${group.key}-${item.href}`}>
                                            <Link
                                              className={styles.searchResultLink}
                                              href={item.href}
                                              onClick={closeSearch}
                                            >
                                              <span className={styles.searchResultText}>
                                                <span className={styles.searchResultTitle}>
                                                  {item.title}
                                                </span>
                                                <span className={styles.searchResultExcerpt}>
                                                  {item.excerpt}
                                                </span>
                                              </span>
                                              {item.meta ? (
                                                <span className={styles.searchResultMeta}>
                                                  {item.meta}
                                                </span>
                                              ) : null}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </section>
                                  ))}
                                </div>
                              ) : (
                                <div className={styles.searchState}>
                                  Không tìm thấy nội dung phù hợp trong blog, sản phẩm hoặc các
                                  trang thông tin công khai.
                                </div>
                              )}
                            </div>
                          ) : searchQuery.length === 1 ? (
                            <div className={styles.searchState}>
                              Nhập ít nhất 2 ký tự để tìm trên blog, sản phẩm và các trang công
                              khai của Vitamind.
                            </div>
                          ) : (
                            <div className={styles.searchMeta}>
                              <section className={styles.searchSection}>
                                <p className={styles.searchLabel}>Truy cập nhanh</p>
                                <ul className={styles.searchLinks}>
                                  {quickLinks.map((item) => (
                                    <li key={item.href}>
                                      <Link
                                        className={styles.searchLink}
                                        href={item.href}
                                        onClick={closeSearch}
                                      >
                                        <span className={styles.searchLinkArrow}>→</span>
                                        <span>{item.label}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </section>
                              <section className={styles.searchSection}>
                                <p className={styles.searchLabel}>Gợi ý khám phá</p>
                                <div className={styles.searchTags}>
                                  {suggestedTopics.map((item) => (
                                    <Link
                                      key={item.label}
                                      href={item.href}
                                      className={styles.searchTag}
                                      onClick={closeSearch}
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </section>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className={`${styles.authSlot} d-none d-sm-flex`}>
                  {!hasMounted || !isAuthLoaded ? (
                    <span className={styles.authPlaceholder} aria-hidden="true" />
                  ) : isSignedIn ? (
                    <HeaderUserMenu user={user} isLoaded={isAuthLoaded} />
                  ) : (
                    <Link
                      href="/sign-in"
                      prefetch={false}
                      className={styles.authFrameLink}
                      aria-label="Đăng nhập"
                    >
                      <svg
                        className={styles.icon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="8.5" r="3.25" />
                        <path d="M6.75 18.5c1.57-2.06 3.35-3.09 5.25-3.09s3.68 1.03 5.25 3.09" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export { Header };
