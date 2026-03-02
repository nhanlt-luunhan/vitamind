"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import styles from "./AuthSplitDeck.module.css";

type Mode = "sign-in" | "sign-up";

type Props = {
  initialMode: Mode;
};

const signInRedirectPath = "/auth/continue";
const signUpRedirectPath = "/auth/continue";

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors?: Array<{ longMessage?: string }> }).errors) &&
    (error as { errors: Array<{ longMessage?: string }> }).errors[0]?.longMessage
  ) {
    return (error as { errors: Array<{ longMessage?: string }> }).errors[0].longMessage ?? fallback;
  }

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
    mode?: "clerk" | "db" | "unknown";
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
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [rememberPassword, setRememberPassword] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInSubmitting, setSignInSubmitting] = useState(false);
  const [signInOauthLoading, setSignInOauthLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [signUpSubmitting, setSignUpSubmitting] = useState(false);
  const [signUpOauthLoading, setSignUpOauthLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpMessage, setSignUpMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;

    setMode(nextMode);
    setSignInError(null);
    setSignUpError(null);
    setSignUpMessage(null);
    setVerifying(false);
    setVerificationCode("");

    const nextPath = nextMode === "sign-in" ? "/sign-in" : "/sign-up";
    if (pathname !== nextPath) {
      router.replace(nextPath, { scroll: false });
    }
  };

  const firstName =
    fullName.trim().split(/\s+/).slice(0, -1).join(" ") || fullName.trim() || undefined;
  const lastName = fullName.trim().split(/\s+/).slice(-1)[0] || undefined;

  // Step 1: resolve identifier
  const [signInStep, setSignInStep] = useState<"identifier" | "db-password" | "clerk-oauth">("identifier");
  const [resolvedIdentifier, setResolvedIdentifier] = useState("");

  const handleResolveIdentifier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signInLoaded) return;

    setSignInSubmitting(true);
    setSignInError(null);

    try {
      const resolved = await resolveSignInIdentifier(signInEmail);

      if (resolved.mode === "db") {
        setResolvedIdentifier(resolved.identifier);
        setSignInStep("db-password");
        return;
      }

      if (resolved.mode === "clerk") {
        setResolvedIdentifier(resolved.identifier);
        setSignInStep("clerk-oauth");
        return;
      }

      // unknown
      setSignInError("Không tìm thấy tài khoản tương ứng với email hoặc GID này.");
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

  const handleGoogleSignIn = async () => {
    if (!signInLoaded) return;

    setSignInOauthLoading(true);
    setSignInError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: signInRedirectPath,
      });
    } catch (error) {
      setSignInOauthLoading(false);
      setSignInError(getErrorMessage(error, "Không thể kết nối Google Sign-In."));
    }
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signUpLoaded) return;

    setSignUpSubmitting(true);
    setSignUpError(null);
    setSignUpMessage(null);

    try {
      const result = await signUp.create({
        emailAddress: signUpEmail,
        password: signUpPassword,
        firstName,
        lastName,
      });

      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        window.location.assign(signUpRedirectPath);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      setSignUpMessage("Mã xác minh đã được gửi tới email của bạn.");
    } catch (error) {
      setSignUpError(getErrorMessage(error, "Không thể tạo tài khoản lúc này."));
    } finally {
      setSignUpSubmitting(false);
    }
  };

  const handleVerifyEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signUpLoaded) return;

    setSignUpSubmitting(true);
    setSignUpError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });

      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        window.location.assign(signUpRedirectPath);
        return;
      }

      setSignUpError("Xác minh chưa hoàn tất. Vui lòng kiểm tra lại mã.");
    } catch (error) {
      setSignUpError(getErrorMessage(error, "Không thể xác minh email."));
    } finally {
      setSignUpSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!signUpLoaded) return;

    setSignUpOauthLoading(true);
    setSignUpError(null);

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: signUpRedirectPath,
      });
    } catch (error) {
      setSignUpOauthLoading(false);
      setSignUpError(getErrorMessage(error, "Không thể kết nối Google Sign-Up."));
    }
  };

  const isSignIn = mode === "sign-in";
  const title = isSignIn ? "Đăng nhập" : verifying ? "Xác minh email" : "Tạo tài khoản";
  const subtitle = isSignIn
    ? ""
    : verifying
      ? "Nhập mã xác minh đã được gửi về email của bạn."
      : "";

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.logoWrap}>
            <Link href="/" className={styles.logoLink}>
              <Image src="/assets/imgs/template/vitamind-day.svg" alt="Vitamind" width={160} height={30} />
            </Link>
          </div>

          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

          <div className={styles.formWrap}>
            {isSignIn ? (
              <>
                {/* Step 1: enter email / GID */}
                {signInStep === "identifier" && (
                  <form className={styles.form} onSubmit={handleResolveIdentifier}>
                    <label className={styles.field}>
                      <span>Email hoặc GID</span>
                      <input
                        type="text"
                        autoComplete="username"
                        value={signInEmail}
                        onChange={(event) => setSignInEmail(event.target.value)}
                        placeholder="Nhập email hoặc GID"
                        required
                      />
                    </label>

                    {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={!signInLoaded || signInSubmitting}
                    >
                      {signInSubmitting ? "Đang kiểm tra..." : "Tiếp tục"}
                    </button>

                    <p className={styles.divider}>Hoặc đăng nhập với</p>

                    <div className={styles.socialRow}>
                      <button
                        type="button"
                        className={styles.socialButton}
                        onClick={handleGoogleSignIn}
                        disabled={!signInLoaded || signInOauthLoading}
                        aria-label="Đăng nhập với Google"
                      >
                        <Image
                          src="/assets/imgs/template/icons/google-icon.png"
                          alt=""
                          width={18}
                          height={18}
                          className={styles.socialButtonIcon}
                        />
                        <span className={styles.socialButtonText}>
                          {signInOauthLoading ? "Đang chuyển sang Google..." : "Đăng nhập với Google"}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2a: DB password login */}
                {signInStep === "db-password" && (
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
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowSignInPassword((v) => !v)}
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

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={signInSubmitting}
                    >
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

                {/* Step 2b: Clerk / Google OAuth */}
                {signInStep === "clerk-oauth" && (
                  <div className={styles.form}>
                    <p className={styles.subtitle} style={{ marginBottom: 0 }}>
                      Tiếp tục đăng nhập với tài khoản Google cho: <strong>{resolvedIdentifier}</strong>
                    </p>

                    {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                    <div className={styles.socialRow}>
                      <button
                        type="button"
                        className={styles.socialButton}
                        onClick={handleGoogleSignIn}
                        disabled={!signInLoaded || signInOauthLoading}
                        aria-label="Đăng nhập với Google"
                      >
                        <Image
                          src="/assets/imgs/template/icons/google-icon.png"
                          alt=""
                          width={18}
                          height={18}
                          className={styles.socialButtonIcon}
                        />
                        <span className={styles.socialButtonText}>
                          {signInOauthLoading ? "Đang chuyển sang Google..." : "Đăng nhập với Google"}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.textLinkStandalone}
                      onClick={() => {
                        setSignInStep("identifier");
                        setSignInError(null);
                      }}
                    >
                      ← Dùng email khác
                    </button>
                  </div>
                )}
              </>

            ) : (
              <>
                {!verifying ? (
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

                    <div className={styles.captchaBlock}>
                      <div
                        id="clerk-captcha"
                        className={styles.captchaSlot}
                        data-cl-theme="light"
                        data-cl-size="flexible"
                        data-cl-language="auto"
                      />
                    </div>

                    {signUpMessage ? <div className={styles.feedbackSuccess}>{signUpMessage}</div> : null}
                    {signUpError ? <div className={styles.feedbackError}>{signUpError}</div> : null}

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={!signUpLoaded || signUpSubmitting}
                    >
                      {signUpSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                    </button>

                    <p className={styles.divider}>Hoặc đăng ký với</p>

                    <div className={styles.socialRow}>
                      <button
                        type="button"
                        className={styles.socialButton}
                        onClick={handleGoogleSignUp}
                        disabled={!signUpLoaded || signUpOauthLoading}
                        aria-label="Đăng ký với Google"
                      >
                        <Image
                          src="/assets/imgs/template/icons/google-icon.png"
                          alt=""
                          width={18}
                          height={18}
                          className={styles.socialButtonIcon}
                        />
                        <span className={styles.socialButtonText}>
                          {signUpOauthLoading ? "Đang chuyển sang Google..." : "Đăng ký với Google"}
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className={styles.form} onSubmit={handleVerifyEmail}>
                    <label className={styles.field}>
                      <span>Mã xác minh</span>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value)}
                        placeholder="Nhập 6 chữ số"
                        required
                      />
                    </label>

                    {signUpMessage ? <div className={styles.feedbackSuccess}>{signUpMessage}</div> : null}
                    {signUpError ? <div className={styles.feedbackError}>{signUpError}</div> : null}

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={!signUpLoaded || signUpSubmitting}
                    >
                      {signUpSubmitting ? "Đang xác minh..." : "Xác minh và tiếp tục"}
                    </button>

                    <button
                      type="button"
                      className={styles.textLinkStandalone}
                      onClick={() => {
                        setVerifying(false);
                        setVerificationCode("");
                        setSignUpError(null);
                      }}
                    >
                      Dùng email khác
                    </button>
                  </form>
                )}
              </>
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
      </div>
    </div>
  );
}
