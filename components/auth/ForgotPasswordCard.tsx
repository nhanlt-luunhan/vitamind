"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthSplitDeck.module.css";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function ForgotPasswordCard() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendResetCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; message?: string; devCode?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Không thể tạo mã khôi phục lúc này.");
        return;
      }

      setStep("reset");
      setMessage(
        data?.devCode
          ? `Mã khôi phục của bạn là: ${data.devCode}`
          : data?.message ?? "Mã khôi phục đã được gửi tới email của bạn.",
      );
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Không thể tạo mã khôi phục lúc này."));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; destination?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Không thể đặt lại mật khẩu.");
        return;
      }

      router.replace(data?.destination ?? "/");
      router.refresh();
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

          <h2 className={styles.title}>{step === "request" ? "Quên mật khẩu" : "Đặt lại mật khẩu"}</h2>
          <p className={styles.subtitle}>
            {step === "request"
              ? "Nhập email tài khoản để nhận mã khôi phục."
              : "Nhập mã khôi phục và mật khẩu mới để tiếp tục."}
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

                <button type="submit" className={styles.primaryButton} disabled={submitting}>
                  {submitting ? "Đang tạo mã..." : "Gửi mã khôi phục"}
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={resetPassword}>
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

                <label className={styles.field}>
                  <span>Mã khôi phục</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Nhập mã 6 số"
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

                <button type="submit" className={styles.primaryButton} disabled={submitting}>
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
                  Gửi mã khác
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
