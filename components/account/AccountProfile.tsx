"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionalUser } from "@/components/auth/useOptionalClerk";
import { Button } from "@/components/ui";

export type AccountUser = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatar_url: string | null;
};

type Props = {
  user: AccountUser;
};

const getInitial = (user: AccountUser) => {
  const source = user.name?.trim() || user.email?.trim();
  return source ? source[0].toUpperCase() : "U";
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function AccountProfile({ user }: Props) {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useOptionalUser();
  const [profile, setProfile] = useState({
    name: user.name ?? "",
    contactEmail: user.contact_email ?? user.email ?? "",
    phone: user.phone ?? "",
    location: user.location ?? "",
    company: user.company ?? "",
    website: user.website ?? "",
    bio: user.bio ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clerkUser?.imageUrl) {
      setAvatarUrl(clerkUser.imageUrl);
    }
  }, [clerkUser?.imageUrl]);

  const handleChange =
    (field: keyof typeof profile) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Không thể cập nhật tài khoản.");
      setSaving(false);
      return;
    }

    const data = await response.json();
    const updated = data?.user as AccountUser | undefined;
    if (updated) {
      setProfile({
        name: updated.name ?? "",
        contactEmail: updated.contact_email ?? updated.email ?? "",
        phone: updated.phone ?? "",
        location: updated.location ?? "",
        company: updated.company ?? "",
        website: updated.website ?? "",
        bio: updated.bio ?? "",
      });
      window.dispatchEvent(new CustomEvent("account-profile-updated"));
    }

    setMessage("Đã lưu thông tin tài khoản.");
    setSaving(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Định dạng ảnh không hỗ trợ.");
      setUploading(false);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Ảnh vượt quá 2MB.");
      setUploading(false);
      return;
    }

    if (!isLoaded || !clerkUser) {
      setError("Chưa sẵn sàng cập nhật avatar.");
      setUploading(false);
      return;
    }

    try {
      await clerkUser.setProfileImage({ file });
      await clerkUser.reload();
      if (clerkUser.imageUrl) {
        setAvatarUrl(clerkUser.imageUrl);
      }
      setMessage("Ảnh đại diện đã được cập nhật.");
      router.refresh();
    } catch {
      setError("Không thể tải ảnh đại diện.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="account-profile">
      <aside className="account-profile__summary">
        <div className="account-card">
          <div className="account-avatar">
            {avatarUrl ? (
              <img className="account-avatar__img" src={avatarUrl} alt="Avatar" />
            ) : (
              <div className="account-avatar__fallback">{getInitial(user)}</div>
            )}
          </div>
          <div className="account-summary-text">
            <h4 className="color-white mb-5">{profile.name || "Chưa đặt tên"}</h4>
            <p className="color-gray-500 mb-0">{profile.contactEmail || user.email}</p>
          </div>
          <div className="account-upload mt-20">
            <label className="btn btn-linear w-100">
              <input
                className="account-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarChange}
              />
              {uploading ? "Đang tải ảnh..." : "Tải ảnh đại diện"}
            </label>
          </div>
        </div>
      </aside>

      <section className="account-profile__main">
        <div className="account-card">
          <h4 className="color-white mb-10">Thông tin cá nhân</h4>

          <form onSubmit={handleSubmit}>
            <div className="account-form-grid">
              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Họ và tên</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={profile.name}
                  onChange={handleChange("name")}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Email đăng nhập</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={user.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Gmail liên hệ</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={profile.contactEmail}
                  onChange={handleChange("contactEmail")}
                  placeholder="ban@gmail.com"
                />
              </div>

              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Số điện thoại</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={profile.phone}
                  onChange={handleChange("phone")}
                  placeholder="0901 234 567"
                />
              </div>

              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Khu vực</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={profile.location}
                  onChange={handleChange("location")}
                  placeholder="TP. Hồ Chí Minh"
                />
              </div>

              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Công ty</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={profile.company}
                  onChange={handleChange("company")}
                  placeholder="Tên công ty"
                />
              </div>

              <div className="form-group">
                <label className="color-gray-700 text-sm mb-10 d-block">Website</label>
                <input
                  className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                  value={profile.website}
                  onChange={handleChange("website")}
                  placeholder="https://domain.com"
                />
              </div>
            </div>

            <div className="form-group account-form-grid__full">
              <label className="color-gray-700 text-sm mb-10 d-block">Giới thiệu ngắn</label>
              <textarea
                className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
                rows={4}
                value={profile.bio}
                onChange={handleChange("bio")}
                placeholder="Chia sẻ ngắn về bạn hoặc công việc của bạn"
              />
            </div>

            {message ? <p className="account-status success">{message}</p> : null}
            {error ? <p className="account-status error">{error}</p> : null}

            <div className="account-actions">
              <Button
                unstyled
                className="btn btn-linear"
                type="submit"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
