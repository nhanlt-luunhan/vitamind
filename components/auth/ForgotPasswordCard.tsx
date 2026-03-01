"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import styles from "./AuthSplitDeck.module.css";

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

async function resolveIdentifierMode(identifier: string) {
  const response = await fetch("/api/auth/resolve-identifier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  if (!response.ok) {
    throw new Error("Không thể kiểm tra tài khoản lúc này.");
  }

  const data = (await response.json()) as { mode?: "clerk" | "db" | "unknown" };
  return data.mode ?? "unknown";
}

export function ForgotPasswordCard() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendResetCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authLoaded || !isLoaded || !signIn) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const mode = await resolveIdentifierMode(email.trim());
      if (mode === "db") {
        setError("Tài khoản này đang dùng đăng nhập nội bộ. Luồng khôi phục hiện chỉ áp dụng cho tài khoản Clerk.");
        return;
      }

      if (mode === "unknown") {
        setError("Không tìm thấy tài khoản tương ứng với email này.");
        return;
      }

      if (isSignedIn) {
        await signOut();
      }

      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });

      setStep("reset");
      setMessage("Mã khôi phục đã được gửi tới email của bạn.");
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Không thể gửi mã khôi phục lúc này."));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authLoaded || !isLoaded || !signIn) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive?.({ session: result.createdSessionId });
        router.replace("/auth/continue");
        return;
      }

      setError("Khôi phục mật khẩu chưa hoàn tất. Vui lòng thử lại.");
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Không thể đặt lại mật khẩu."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.logoWrap}>
            <Link href="/" className={styles.logoLink}>
              <Image src="/assets/imgs/template/vitamind-day.svg" alt="Vitamind" width={160} height={30} />
            </Link>
          </div>

          <h2 className={styles.title}>
            {step === "request" ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
          </h2>
          <p className={styles.subtitle}>
            {step === "request"
              ? "Nhập email tài khoản để nhận mã khôi phục từ Clerk."
              : "Nhập mã trong email và thiết lập mật khẩu mới."}
          </p>

          <div className={styles.formWrap}>
            {step === "request" ? (
              <form className={styles.form} onSubmit={sendResetCode}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Nhập email tài khoản"
                    required
                  />
                </label>

                {message ? <div className={styles.feedbackSuccess}>{message}</div> : null}
                {error ? <div className={styles.feedbackError}>{error}</div> : null}

                <button type="submit" className={styles.primaryButton} disabled={!isLoaded || submitting}>
                  {submitting ? "Đang gửi mã..." : "Gửi mã khôi phục"}
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={resetPassword}>
                <label className={styles.field}>
                  <span>Mã khôi phục</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Nhập mã trong email"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Mật khẩu mới</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </label>

                {message ? <div className={styles.feedbackSuccess}>{message}</div> : null}
                {error ? <div className={styles.feedbackError}>{error}</div> : null}

                <button type="submit" className={styles.primaryButton} disabled={!isLoaded || submitting}>
                  {submitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </button>

                <button
                  type="button"
                  className={styles.textLinkStandalone}
                  onClick={() => {
                    setStep("request");
                    setCode("");
                    setPassword("");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Gửi lại mã khác
                </button>
              </form>
            )}
          </div>
        </section>

        <p className={styles.footerLine}>
          Nhớ mật khẩu rồi?
          <Link href="/sign-in" className={styles.footerLink}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
