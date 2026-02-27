"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Đăng ký thất bại.");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <form className="mt-30" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="color-gray-700 text-sm mb-10 d-block">Họ tên</label>
        <input
          className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
          type="text"
          name="name"
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div className="form-group">
        <label className="color-gray-700 text-sm mb-10 d-block">Email</label>
        <input
          className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
          type="email"
          name="email"
          placeholder="you@domain.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label className="color-gray-700 text-sm mb-10 d-block">Mật khẩu</label>
        <input
          className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label className="color-gray-700 text-sm mb-10 d-block">Nhập lại mật khẩu</label>
        <input
          className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
          type="password"
          name="confirm"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>

      {error ? <p className="admin-error mt-10">{error}</p> : null}

      <Button unstyled className="btn btn-linear w-100 hover-up" type="submit" disabled={loading}>
        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </Button>
    </form>
  );
}
