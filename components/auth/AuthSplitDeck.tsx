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

const postAuthPath = "/auth/continue";

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

  const data = (await response.json()) as { identifier?: string };
  return (data.identifier ?? identifier).trim();
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.5 14.5 2.6 12 2.6 6.9 2.6 2.8 6.7 2.8 11.8S6.9 21 12 21c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12Z"
      />
      <path
        fill="#34A853"
        d="M2.8 7.3l3.2 2.4c.9-2.7 3.3-4.6 6-4.6 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.5 14.5 2.6 12 2.6 8.1 2.6 4.7 4.8 2.8 7.3Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21c2.4 0 4.5-.8 6-2.3l-2.8-2.2c-.8.5-1.8.9-3.2.9-3.8 0-5.2-2.5-5.4-3.8l-3.3 2.5C5.1 18.7 8.3 21 12 21Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 13.7c0-.5 0-.9-.1-1.3H12v3.9h5.4c-.3 1.3-1.2 2.4-2.5 3.1l2.8 2.2c1.7-1.6 3.4-4.5 3.4-7.9Z"
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
  const [signInSubmitting, setSignInSubmitting] = useState(false);
  const [signInOauthLoading, setSignInOauthLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
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

  const handlePasswordSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signInLoaded) return;

    setSignInSubmitting(true);
    setSignInError(null);

    try {
      const resolvedIdentifier = await resolveSignInIdentifier(signInEmail);
      const result = await signIn.create({
        identifier: resolvedIdentifier,
        password: signInPassword,
      });

      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        window.location.assign(postAuthPath);
        return;
      }

      setSignInError("Đăng nhập chưa hoàn tất. Vui lòng thử lại.");
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
        redirectUrlComplete: postAuthPath,
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
        window.location.assign(postAuthPath);
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
        window.location.assign(postAuthPath);
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
        redirectUrlComplete: postAuthPath,
      });
    } catch (error) {
      setSignUpOauthLoading(false);
      setSignUpError(getErrorMessage(error, "Không thể kết nối Google Sign-Up."));
    }
  };

  const isSignIn = mode === "sign-in";
  const title = isSignIn ? "Đăng nhập" : verifying ? "Xác minh email" : "Tạo tài khoản";
  const subtitle = isSignIn
    ? "Nhập email và mật khẩu để truy cập vào hệ thống."
    : verifying
      ? "Nhập mã xác minh đã được gửi về email của bạn."
      : "Tạo tài khoản mới. Chỉ mất chưa đến một phút.";

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
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.formWrap}>
            {isSignIn ? (
              <form className={styles.form} onSubmit={handlePasswordSignIn}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="username"
                    value={signInEmail}
                    onChange={(event) => setSignInEmail(event.target.value)}
                    placeholder="Nhập email"
                    required
                  />
                </label>

                <div className={styles.passwordHead}>
                  <span>Mật khẩu</span>
                  <button
                    type="button"
                    className={styles.textLink}
                    onClick={() => setSignInError("Tính năng quên mật khẩu sẽ được bật ở bước tiếp theo.")}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <input
                  type="password"
                  autoComplete="current-password"
                  value={signInPassword}
                  onChange={(event) => setSignInPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                />

                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={rememberPassword}
                    onChange={(event) => setRememberPassword(event.target.checked)}
                  />
                  <span>Lưu mật khẩu</span>
                </label>

                {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!signInLoaded || signInSubmitting}
                >
                  {signInSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
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
                    <GoogleMark />
                  </button>
                </div>
              </form>
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

                    <label className={styles.field}>
                      <span>Mật khẩu</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={signUpPassword}
                        onChange={(event) => setSignUpPassword(event.target.value)}
                        placeholder="Tạo mật khẩu"
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
                        <GoogleMark />
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
