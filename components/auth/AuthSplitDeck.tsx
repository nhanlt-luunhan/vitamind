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
    throw new Error("Khong the kiem tra email luc nay.");
  }

  const data = (await response.json()) as {
    mode?: "db" | "unknown";
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
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpSubmitting, setSignUpSubmitting] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signInStep, setSignInStep] = useState<"identifier" | "password">("identifier");
  const [resolvedIdentifier, setResolvedIdentifier] = useState("");
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
    setSignInStep("identifier");
    setResolvedIdentifier("");
    setSignInPassword("");

    const nextPath = nextMode === "sign-in" ? "/sign-in" : "/sign-up";
    if (pathname !== nextPath) {
      router.replace(nextPath, { scroll: false });
    }
  };

  const handleResolveIdentifier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInSubmitting(true);
    setSignInError(null);

    try {
      const resolved = await resolveSignInIdentifier(signInEmail);
      setResolvedIdentifier(resolved.identifier);

      if (resolved.mode !== "db") {
        setSignInError("Khong tim thay tai khoan phu hop. Ban co the tao tai khoan moi.");
        return;
      }

      setSignInStep("password");
    } catch (error) {
      setSignInError(getErrorMessage(error, "Khong the kiem tra email luc nay."));
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
        setSignInError(data?.error ?? "Khong the dang nhap luc nay.");
        return;
      }

      window.location.assign(data?.destination ?? "/");
    } catch (error) {
      setSignInError(getErrorMessage(error, "Khong the dang nhap luc nay."));
    } finally {
      setSignInSubmitting(false);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; destination?: string }
        | null;

      if (!response.ok) {
        setSignUpError(data?.error ?? "Khong the tao tai khoan luc nay.");
        return;
      }

      window.location.assign(data?.destination ?? "/");
    } catch (error) {
      setSignUpError(getErrorMessage(error, "Khong the tao tai khoan luc nay."));
    } finally {
      setSignUpSubmitting(false);
    }
  };

  const isSignIn = mode === "sign-in";
  const title = isSignIn ? "Dang nhap" : "Tao tai khoan";
  const subtitle = isSignIn
    ? "Dang nhap bang tai khoan noi bo."
    : "Tao tai khoan email va mat khau de tiep tuc.";

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
                  Dang chuyen huong den khu vuc cua ban...
                </div>
                <Link
                  href="/"
                  className={styles.primaryButton}
                  style={{ textDecoration: "none" }}
                >
                  Di ngay
                </Link>
                <button
                  type="button"
                  className={styles.textLinkStandalone}
                  onClick={() => window.location.assign("/logout")}
                  style={{ marginTop: "12px" }}
                >
                  Dang xuat tai khoan hien tai
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
                        placeholder="Nhap dia chi email cua ban"
                        required
                      />
                    </label>

                    {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                    <button type="submit" className={styles.primaryButton} disabled={signInSubmitting}>
                      {signInSubmitting ? "Dang kiem tra..." : "Tiep tuc"}
                    </button>

                    <button
                      type="button"
                      className={styles.textLinkStandalone}
                      onClick={() => router.push("/forgot-password")}
                    >
                      Quen mat khau?
                    </button>

                    {isGoogleEnabled ? (
                      <>
                        <p className={styles.divider}>Hoac tiep tuc voi</p>

                        <div className={styles.socialRow}>
                          <button
                            type="button"
                            className={styles.socialButton}
                            onClick={() => window.location.assign("/api/auth/google/start?mode=sign-in")}
                            aria-label="Dang nhap voi Google"
                          >
                            <Image
                              src="/assets/imgs/template/icons/google-icon.png"
                              alt=""
                              width={18}
                              height={18}
                              className={styles.socialButtonIcon}
                            />
                            <span className={styles.socialButtonText}>Dang nhap voi Google</span>
                          </button>
                        </div>
                      </>
                    ) : null}
                  </form>
                )}

                {signInStep === "password" && (
                  <form className={styles.form} onSubmit={handleDbPasswordSignIn}>
                    <p className={styles.subtitle} style={{ marginBottom: 0 }}>
                      Dang nhap cho: <strong>{resolvedIdentifier}</strong>
                    </p>

                    <div className={styles.passwordHead}>
                      <span>Mat khau</span>
                      <button
                        type="button"
                        className={styles.textLink}
                        onClick={() => router.push("/forgot-password")}
                      >
                        Quen mat khau?
                      </button>
                    </div>

                    <div className={styles.passwordField}>
                      <input
                        type={showSignInPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={signInPassword}
                        onChange={(event) => setSignInPassword(event.target.value)}
                        placeholder="Nhap mat khau"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowSignInPassword((value) => !value)}
                        aria-label={showSignInPassword ? "An mat khau" : "Hien mat khau"}
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
                      <span>Luu dang nhap</span>
                    </label>

                    {signInError ? <div className={styles.feedbackError}>{signInError}</div> : null}

                    <button type="submit" className={styles.primaryButton} disabled={signInSubmitting}>
                      {signInSubmitting ? "Dang dang nhap..." : "Dang nhap"}
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
                      ← Dung email khac
                    </button>
                  </form>
                )}
              </>
            ) : (
              <form className={styles.form} onSubmit={handleCreateAccount}>
                <label className={styles.field}>
                  <span>Ho va ten</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nhap ho va ten"
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
                    placeholder="Nhap email"
                    required
                  />
                </label>

                <div className={styles.field}>
                  <span>Mat khau</span>
                  <div className={styles.passwordField}>
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={signUpPassword}
                      onChange={(event) => setSignUpPassword(event.target.value)}
                      placeholder="Tao mat khau"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowSignUpPassword((value) => !value)}
                      aria-label={showSignUpPassword ? "An mat khau" : "Hien mat khau"}
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
                  {signUpSubmitting ? "Dang tao tai khoan..." : "Tao tai khoan"}
                </button>

                {isGoogleEnabled ? (
                  <>
                    <p className={styles.divider}>Hoac dang ky voi</p>

                    <div className={styles.socialRow}>
                      <button
                        type="button"
                        className={styles.socialButton}
                        onClick={() => window.location.assign("/api/auth/google/start?mode=sign-up")}
                        aria-label="Dang ky voi Google"
                      >
                        <Image
                          src="/assets/imgs/template/icons/google-icon.png"
                          alt=""
                          width={18}
                          height={18}
                          className={styles.socialButtonIcon}
                        />
                        <span className={styles.socialButtonText}>Dang ky voi Google</span>
                      </button>
                    </div>
                  </>
                ) : null}
              </form>
            )}
          </div>
        </section>

        <p className={styles.footerLine}>
          {isSignIn ? "Ban chua co tai khoan?" : "Da co tai khoan?"}
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => switchMode(isSignIn ? "sign-up" : "sign-in")}
          >
            {isSignIn ? "Tao moi" : "Dang nhap"}
          </button>
        </p>
      </div>
    </div>
  );
}
