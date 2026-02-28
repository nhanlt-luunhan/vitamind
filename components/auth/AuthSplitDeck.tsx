"use client";

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

const signInNotes = [
  {
    title: "Về thẳng đúng nơi cần làm việc",
    text: "Tài khoản thường quay về trang chủ. Tài khoản quản trị đi thẳng vào khu điều hành.",
  },
  {
    title: "Giữ nhịp thao tác gọn",
    text: "Không dùng widget mặc định, chỉ giữ các trường và thao tác cần thiết bằng tiếng Việt.",
  },
];

const signUpNotes = [
  {
    label: "01",
    title: "Tạo hồ sơ cơ bản",
    text: "Khởi tạo tên hiển thị, email và mật khẩu trong cùng một nhịp giao diện.",
  },
  {
    label: "02",
    title: "Xác minh email",
    text: "Nếu hệ thống yêu cầu, mã xác minh sẽ được gửi về email ngay sau khi tạo tài khoản.",
  },
  {
    label: "03",
    title: "Bổ sung hồ sơ",
    text: "Sau khi vào hệ thống, bạn có thể cập nhật số điện thoại, Gmail liên hệ và GID.",
  },
];

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
    throw new Error("Không thể kiểm tra email hoặc GID lúc này.");
  }

  const data = (await response.json()) as { identifier?: string };
  return (data.identifier ?? identifier).trim();
}

export function AuthSplitDeck({ initialMode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();

  const [mode, setMode] = useState<Mode>(initialMode);

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
      setSignUpMessage("Mã xác minh đã được gửi đến email của bạn.");
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
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

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

  return (
    <div className={styles.page}>
      <div className={styles.canvas}>
        <section className={`${styles.stage} ${mode === "sign-up" ? styles.stageSignUp : ""}`}>
          <header className={styles.stageHeader}>
            <Link href="/" className={styles.brand}>
              Vitamind
            </Link>

            <div className={styles.switcher} role="tablist" aria-label="Chuyển đổi xác thực">
              <button
                type="button"
                className={`${styles.switcherButton} ${mode === "sign-in" ? styles.switcherButtonActive : ""}`}
                onClick={() => switchMode("sign-in")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`${styles.switcherButton} ${mode === "sign-up" ? styles.switcherButtonActive : ""}`}
                onClick={() => switchMode("sign-up")}
              >
                Tạo tài khoản
              </button>
            </div>
          </header>

          <div className={styles.stack}>
            <div className={styles.wipe} aria-hidden="true" />

            <section
              className={`${styles.panel} ${styles.signInPanel} ${mode === "sign-in" ? styles.panelActive : styles.panelInactive}`}
              aria-hidden={mode !== "sign-in"}
            >
              <div className={styles.panelTop}>
                <div className={styles.panelIntro}>
                  <span className={styles.panelBadge}>Đăng nhập</span>
                  <h1>Quay lại hệ thống bằng đúng tài khoản của bạn.</h1>
                  <p>
                    Luồng đăng nhập được rút gọn theo tiếng Việt, giữ đúng vai trò tài khoản và đưa
                    bạn tới nơi cần làm việc ngay sau khi xác thực.
                  </p>
                </div>

                <div className={styles.panelSideNote}>
                  <strong>Đúng vai trò, đúng điểm đến.</strong>
                  <p>
                    Người dùng thường về trang chủ. Tài khoản quản trị sẽ đi vào khu điều hành sau
                    bước xác thực thành công.
                  </p>
                </div>
              </div>

              <div className={styles.signInGrid}>
                <form className={styles.form} onSubmit={handlePasswordSignIn}>
                  <label className={styles.field}>
                    <span>Email đăng nhập hoặc GID</span>
                    <input
                      type="text"
                      autoComplete="username"
                      value={signInEmail}
                      onChange={(event) => setSignInEmail(event.target.value)}
                      placeholder="ban@vitamind.com hoặc 5015114132"
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Mật khẩu</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={signInPassword}
                      onChange={(event) => setSignInPassword(event.target.value)}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </label>

                  {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={!signInLoaded || signInSubmitting}
                  >
                    {signInSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>

                  <div className={styles.divider}>
                    <span>hoặc</span>
                  </div>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleGoogleSignIn}
                    disabled={!signInLoaded || signInOauthLoading}
                  >
                    <span className={styles.secondaryIcon}>G</span>
                    {signInOauthLoading ? "Đang mở Google..." : "Tiếp tục với Google"}
                  </button>
                </form>

                <div className={styles.cardRail}>
                  {signInNotes.map((item) => (
                    <article key={item.title} className={styles.miniCard}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>

              <footer className={styles.authFooter}>
                <p className={styles.footerText}>
                  Chưa có tài khoản? Chuyển sang tạo tài khoản mới mà không rời trang này.
                </p>
                <div className={styles.footerLinks}>
                  <button type="button" className={styles.ghostButton} onClick={() => switchMode("sign-up")}>
                    Mở màn tạo tài khoản
                  </button>
                  <Link href="/">Về trang chủ</Link>
                </div>
              </footer>
            </section>

            <section
              className={`${styles.panel} ${styles.signUpPanel} ${mode === "sign-up" ? styles.panelActive : styles.panelInactive}`}
              aria-hidden={mode !== "sign-up"}
            >
              <div className={styles.panelTop}>
                <div className={styles.panelIntro}>
                  <span className={`${styles.panelBadge} ${styles.panelBadgeAccent}`}>Tạo tài khoản</span>
                  <h1>Tạo hồ sơ mới trong một lớp giao diện riêng.</h1>
                  <p>
                    Màn đăng ký dùng nhịp bố cục khác với đăng nhập, nhưng vẫn nằm trong cùng khung
                    và chuyển qua lại bằng wipe transition.
                  </p>
                </div>

                <div className={styles.panelSideNote}>
                  <strong>Khởi tạo gọn, bổ sung sau.</strong>
                  <p>
                    Sau khi vào hệ thống, bạn có thể chỉnh tên hiển thị, Gmail liên hệ, số điện
                    thoại và GID trong phần tài khoản.
                  </p>
                </div>
              </div>

              <div className={styles.signUpGrid}>
                <div>
                  {!verifying ? (
                    <form className={styles.form} onSubmit={handleCreateAccount}>
                      <div className={styles.signUpFields}>
                        <label className={`${styles.field} ${styles.fieldFull}`}>
                          <span>Họ và tên</span>
                          <input
                            type="text"
                            autoComplete="name"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            placeholder="Lưu Nhân"
                            required
                          />
                        </label>

                        <label className={styles.field}>
                          <span>Email liên hệ</span>
                          <input
                            type="email"
                            autoComplete="email"
                            value={signUpEmail}
                            onChange={(event) => setSignUpEmail(event.target.value)}
                            placeholder="ban@vitamind.com"
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
                            placeholder="Tạo mật khẩu mới"
                            required
                          />
                        </label>
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

                      <div className={styles.divider}>
                        <span>hoặc</span>
                      </div>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleGoogleSignUp}
                        disabled={!signUpLoaded || signUpOauthLoading}
                      >
                        <span className={styles.secondaryIcon}>G</span>
                        {signUpOauthLoading ? "Đang mở Google..." : "Đăng ký với Google"}
                      </button>
                    </form>
                  ) : (
                    <form className={styles.form} onSubmit={handleVerifyEmail}>
                      <label className={`${styles.field} ${styles.fieldFull}`}>
                        <span>Mã xác minh email</span>
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
                        className={styles.ghostButton}
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
                </div>

                <aside className={styles.cardRail}>
                  {verifying ? (
                    <article className={styles.statusCard}>
                      <span className={styles.panelBadge}>Xác minh</span>
                      <h3>Kiểm tra hộp thư của bạn</h3>
                      <p>
                        Nếu chưa thấy email, kiểm tra thư rác hoặc quay lại dùng địa chỉ khác để tạo
                        mã xác minh mới.
                      </p>
                    </article>
                  ) : (
                    signUpNotes.map((item) => (
                      <article key={item.title} className={styles.miniCard}>
                        <span className={styles.panelBadge}>{item.label}</span>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </article>
                    ))
                  )}
                </aside>
              </div>

              <footer className={styles.authFooter}>
                <p className={styles.footerText}>Đã có tài khoản? Quay lại đăng nhập mà không rời nhịp giao diện này.</p>
                <div className={styles.footerLinks}>
                  <button type="button" className={styles.ghostButton} onClick={() => switchMode("sign-in")}>
                    Mở màn đăng nhập
                  </button>
                  <Link href="/blog">Xem bài viết</Link>
                </div>
              </footer>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
