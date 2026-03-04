"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionUser } from "./useSessionUser";
import styles from "./AuthSplitDeck.module.css";

type Mode = "sign-in" | "sign-up";

type Props = {
  initialMode: Mode;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function resolveSignInIdentifier(identifier: string) {
  const response = await fetch("/api/auth/resolve-identifier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  if (!response.ok) {
    throw new Error("Không thể kiểm tra email lúc này.");
  }

  const data = (await response.json()) as {
    mode?: "db" | "google" | "unknown";
    identifier?: string;
  };

  return {
    mode: data.mode ?? "unknown",
    identifier: (data.identifier ?? identifier).trim(),
  };
}

function EyeOpenMark() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeClosedMark() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M3 3l18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6 6.3A10.9 10.9 0 0 1 12 6c6.4 0 10 6 10 6a19 19 0 0 1-4 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.7 6.8C4 8.4 2 12 2 12a19 19 0 0 0 10 6c1.5 0 2.8-.3 4-.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9A3 3 0 0 0 14.1 14.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthSplitDeck({ initialMode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded: isSessionLoaded, isSignedIn, user } = useSessionUser();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInSubmitting, setSignInSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInSuggestGoogle, setSignInSuggestGoogle] = useState(false);
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpSubmitting, setSignUpSubmitting] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signInStep, setSignInStep] = useState<"identifier" | "password">("identifier");
  const [resolvedIdentifier, setResolvedIdentifier] = useState("");
  // sign-up state
  const [signUpStep, setSignUpStep] = useState<"form" | "verify">("form");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const isGoogleEnabled = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "1",
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!isSessionLoaded || !isSignedIn || !user) {
      return;
    }

    router.replace("/");
  }, [isSessionLoaded, isSignedIn, router, user]);

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;

    setMode(nextMode);
    setSignInError(null);
    setSignUpError(null);
    setSignInSuggestGoogle(false);
    setSignInStep("identifier");
    setResolvedIdentifier("");
    setSignInPassword("");
    // reset sign-up
    setSignUpStep("form");
    setVerifiedToken("");
    setOtpCode("");
    setOtpError(null);
    setResendCooldown(0);

    const nextPath = nextMode === "sign-in" ? "/sign-in" : "/sign-up";
    if (pathname !== nextPath) {
      router.replace(nextPath, { scroll: false });
    }
  };

  const handleResolveIdentifier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInSubmitting(true);
    setSignInError(null);
    setSignInSuggestGoogle(false);

    try {
      const resolved = await resolveSignInIdentifier(signInEmail);
      setResolvedIdentifier(resolved.identifier);

      if (resolved.mode === "google") {
        // Tài khoản này chỉ dùng Google — redirect ngay
        window.location.assign("/api/auth/google/start?mode=sign-in");
        return;
      }

      if (resolved.mode !== "db") {
        setSignInError("Không tìm thấy tài khoản. Bạn có thể tạo tài khoản mới.");
        if (isGoogleEnabled) setSignInSuggestGoogle(true);
        return;
      }

      setSignInStep("password");
    } catch (error) {
      setSignInError(getErrorMessage(error, "Không thể kiểm tra email lúc này."));
    } finally {
      setSignInSubmitting(false);
    }
  };

  const handleDbPasswordSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInSubmitting(true);
    setSignInError(null);

    try {
      const response = await fetch("/api/auth/db-sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: resolvedIdentifier,
          password: signInPassword,
          remember: rememberPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; destination?: string }
        | null;

      if (!response.ok) {
        setSignInError(data?.error ?? "Không thể đăng nhập lúc này.");
        return;
      }

      window.location.assign(data?.destination ?? "/");
    } catch (error) {
      setSignInError(getErrorMessage(error, "Không thể đăng nhập lúc này."));
    } finally {
      setSignInSubmitting(false);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignUpSubmitting(true);
    setSignUpError(null);

    // Bước 1: gửi mã OTP xác thực email
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signUpEmail }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; devCode?: string }
        | null;

      if (!response.ok) {
        setSignUpError(data?.error ?? "Không thể gửi mã xác thực lúc này.");
        return;
      }

      // Dev mode: tự điền OTP để tiện test
      if (data?.devCode) {
        setOtpCode(data.devCode);
      }

      // Chuyển sang bước nhập OTP
      setSignUpStep("verify");
      setOtpError(null);
      startResendCooldown();
    } catch (error) {
      setSignUpError(getErrorMessage(error, "Không thể gửi mã xác thực lúc này."));
    } finally {
      setSignUpSubmitting(false);
    }
  };

  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError(null);
    setOtpSubmitting(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signUpEmail }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; devCode?: string }
        | null;
      if (!response.ok) {
        setOtpError(data?.error ?? "Không thể gửi lại mã.");
        return;
      }
      if (data?.devCode) setOtpCode(data.devCode);
      startResendCooldown();
    } catch (error) {
      setOtpError(getErrorMessage(error, "Không thể gửi lại mã."));
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpSubmitting(true);
    setOtpError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signUpEmail, code: otpCode }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; verified_token?: string }
        | null;

      if (!response.ok) {
        setOtpError(data?.error ?? "Mã xác thực không đúng.");
        return;
      }

      // Lưu verified_token — trực tiếp tạo tài khoản
      const token = data?.verified_token ?? "";
      setVerifiedToken(token);

      // Tự động submit tạo tài khoản sau khi OTP hợp lệ
      await doCreateAccount(token);
    } catch (error) {
      setOtpError(getErrorMessage(error, "Không thể xác thực lúc này."));
    } finally {
      setOtpSubmitting(false);
    }
  };

  const doCreateAccount = async (token: string) => {
    setSignUpSubmitting(true);
    setSignUpError(null);

    try {
      const response = await fetch("/api/auth/db-sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: signUpEmail,
          password: signUpPassword,
          remember: true,
          verified_token: token,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; destination?: string }
        | null;

      if (!response.ok) {
        setSignUpError(data?.error ?? "Không thể tạo tài khoản lúc này.");
        // Nếu lỗi tạo TK, quay lại bước form
        setSignUpStep("form");
        return;
      }

      window.location.assign(data?.destination ?? "/");
    } catch (error) {
      setSignUpError(getErrorMessage(error, "Không thể tạo tài khoản lúc này."));
      setSignUpStep("form");
    } finally {
      setSignUpSubmitting(false);
    }
  };

  const isSignIn = mode === "sign-in";
  const title = isSignIn ? "Đăng nhập" : "Tạo tài khoản";
  const subtitle = isSignIn
    ? "Đăng nhập bằng tài khoản nội bộ."
    : "Tạo tài khoản bằng email và mật khẩu để tiếp tục.";

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.logoWrap}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/assets/imgs/template/vitamind-day.svg"
                alt="Vitamind"
                width={120}
                height={22}
                priority
                className={`${styles.logoImage} ${styles.logoDay}`}
              />
              <Image
                src="/assets/imgs/template/vitamind-night.svg"
                alt=""
                width={120}
                height={22}
                priority
                aria-hidden="true"
                className={`${styles.logoImage} ${styles.logoNight}`}
              />
            </Link>
          </div>

          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.formWrap}>
            {isSignedIn ? (
              <div className={styles.form} style={{ textAlign: "center" }}>
                <div className={styles.feedbackSuccess} style={{ marginBottom: "16px" }}>
                  Đang chuyển hướng đến khu vực của bạn...
                </div>
                <Link
                  href="/"
                  className={styles.primaryButton}
                  style={{ textDecoration: "none" }}
                >
                  Đi ngay
                </Link>
                <button
                  type="button"
                  className={styles.textLinkStandalone}
                  onClick={() => window.location.assign("/logout")}
                  style={{ marginTop: "12px" }}
                >
                  Đăng xuất tài khoản hiện tại
                </button>
              </div>
            ) : isSignIn ? (
              <>
                {signInStep === "identifier" && (
                  <form className={styles.form} onSubmit={handleResolveIdentifier}>
                    <label className={styles.field}>
                      <span>Email</span>
                      <input
                        type="text"
                        autoComplete="username"
                        value={signInEmail}
                        onChange={(event) => setSignInEmail(event.target.value)}
                        placeholder="Nhập địa chỉ email của bạn"
                        required
                      />
                    </label>

                    {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                    <button type="submit" className={styles.primaryButton} disabled={signInSubmitting}>
                      {signInSubmitting ? "Đang kiểm tra..." : "Tiếp tục"}
                    </button>

                    <button
                      type="button"
                      className={styles.textLinkStandalone}
                      onClick={() => router.push("/forgot-password")}
                    >
                      Quên mật khẩu?
                    </button>

                    {isGoogleEnabled || signInSuggestGoogle ? (
                      <>
                        <p className={styles.divider}>
                          {signInSuggestGoogle ? "Thử đăng nhập với" : "Hoặc tiếp tục với"}
                        </p>

                        <div className={styles.socialRow}>
                          <button
                            type="button"
                            className={styles.socialButton}
                            onClick={() => window.location.assign("/api/auth/google/start?mode=sign-in")}
                            aria-label="Đăng nhập với Google"
                          >
                            <Image
                              src="/assets/imgs/template/icons/google-icon.png"
                              alt=""
                              width={18}
                              height={18}
                              className={styles.socialButtonIcon}
                            />
                            <span className={styles.socialButtonText}>Đăng nhập với Google</span>
                          </button>
                        </div>
                      </>
                    ) : null}
                  </form>
                )}

                {signInStep === "password" && (
                  <form className={styles.form} onSubmit={handleDbPasswordSignIn}>
                    <p className={styles.subtitle} style={{ marginBottom: 0 }}>
                      Đăng nhập cho: <strong>{resolvedIdentifier}</strong>
                    </p>

                    <div className={styles.passwordHead}>
                      <span>Mật khẩu</span>
                      <button
                        type="button"
                        className={styles.textLink}
                        onClick={() => router.push("/forgot-password")}
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <div className={styles.passwordField}>
                      <input
                        type={showSignInPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={signInPassword}
                        onChange={(event) => setSignInPassword(event.target.value)}
                        placeholder="Nhập mật khẩu"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowSignInPassword((value) => !value)}
                        aria-label={showSignInPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        aria-pressed={showSignInPassword}
                      >
                        {showSignInPassword ? <EyeClosedMark /> : <EyeOpenMark />}
                      </button>
                    </div>

                    <label className={styles.checkRow}>
                      <input
                        type="checkbox"
                        checked={rememberPassword}
                        onChange={(event) => setRememberPassword(event.target.checked)}
                      />
                      <span>Lưu đăng nhập</span>
                    </label>

                    {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                    <button type="submit" className={styles.primaryButton} disabled={signInSubmitting}>
                      {signInSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    <button
                      type="button"
                      className={styles.textLinkStandalone}
                      onClick={() => {
                        setSignInStep("identifier");
                        setSignInPassword("");
                        setSignInError(null);
                      }}
                    >
                      ← Dùng email khác
                    </button>
                  </form>
                )}
              </>
            ) : signUpStep === "verify" ? (
              /* --- Bước 2: Nhập OTP --- */
              <form className={styles.form} onSubmit={handleVerifyOtp}>
                <div className={styles.otpHeader}>
                  <p className={styles.subtitle} style={{ marginBottom: 4 }}>
                    Đã gửi mã xác thực tới
                  </p>
                  <strong style={{ color: "var(--page-text)" }}>{signUpEmail}</strong>
                </div>

                <label className={styles.field}>
                  <span>Mã xác thực</span>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(event) => {
                      const val = event.target.value.replace(/\D/g, "");
                      setOtpCode(val);
                    }}
                    placeholder="6 chữ số"
                    required
                    autoFocus
                  />
                </label>

                {otpError ? <div className={styles.feedbackError}>{otpError}</div> : null}

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={otpSubmitting || otpCode.length < 6}
                >
                  {otpSubmitting ? "Đang xác thực..." : "Xác thực và tạo tài khoản"}
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <button
                    type="button"
                    className={styles.textLinkStandalone}
                    onClick={() => {
                      setSignUpStep("form");
                      setOtpCode("");
                      setOtpError(null);
                    }}
                  >
                    ← Thay đổi thông tin
                  </button>

                  <button
                    type="button"
                    className={styles.textLinkStandalone}
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || otpSubmitting}
                  >
                    {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại mã"}
                  </button>
                </div>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleCreateAccount}>
                <label className={styles.field}>
                  <span>Họ và tên</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={signUpEmail}
                    onChange={(event) => setSignUpEmail(event.target.value)}
                    placeholder="Nhập email"
                    required
                  />
                </label>

                <div className={styles.field}>
                  <span>Mật khẩu</span>
                  <div className={styles.passwordField}>
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={signUpPassword}
                      onChange={(event) => setSignUpPassword(event.target.value)}
                      placeholder="Tạo mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowSignUpPassword((value) => !value)}
                      aria-label={showSignUpPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      aria-pressed={showSignUpPassword}
                    >
                      {showSignUpPassword ? <EyeClosedMark /> : <EyeOpenMark />}
                    </button>
                  </div>
                </div>

                {signUpError ? <div className={styles.feedbackError}>{signUpError}</div> : null}

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={signUpSubmitting}
                >
                  {signUpSubmitting ? "Đang gửi mã..." : "Tiếp tục"}
                </button>

                {isGoogleEnabled ? (
                  <>
                    <p className={styles.divider}>Hoặc đăng ký với</p>

                    <div className={styles.socialRow}>
                      <button
                        type="button"
                        className={styles.socialButton}
                        onClick={() => window.location.assign("/api/auth/google/start?mode=sign-up")}
                        aria-label="Đăng ký với Google"
                      >
                        <Image
                          src="/assets/imgs/template/icons/google-icon.png"
                          alt=""
                          width={18}
                          height={18}
                          className={styles.socialButtonIcon}
                        />
                        <span className={styles.socialButtonText}>Đăng ký với Google</span>
                      </button>
                    </div>
                  </>
                ) : null}
              </form>
            )}
          </div>
        </section>

        <p className={styles.footerLine}>
          {isSignIn ? "Bạn chưa có tài khoản?" : "Đã có tài khoản?"}
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => switchMode(isSignIn ? "sign-up" : "sign-in")}
          >
            {isSignIn ? "Tạo mới" : "Đăng nhập"}
          </button>
        </p>
      </div >
    </div >
  );
}
