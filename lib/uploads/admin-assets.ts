import { saveProjectUpload } from "@/lib/uploads/rules";

export type AdminUploadScope = "posts" | "products";

export async function saveAdminImageUpload(scope: AdminUploadScope, file: File) {
  const saved = await saveProjectUpload({
    scope,
    file,
    trackInMedia: true,
    meta: { owner: "admin" },
  });
  if (!saved.media) {
    throw new Error("Không thể ghi nhận ảnh quản trị.");
  }
  return saved.media;
}
