import path from "path";
import crypto from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { query } from "@/lib/db/admin-db";

type MediaRow = {
  id: string;
  url: string;
  type: string | null;
  meta: unknown;
  created_at: string;
  updated_at: string | null;
};

export type UploadRule = {
  scope: string;
  folder: string;
  maxSize: number;
  allowedTypes: string[];
  trackInMedia: boolean;
  kind: "image" | "document" | "mixed" | "generic";
  source: "preset" | "inferred";
};

type SaveProjectUploadInput = {
  scope: string;
  file: File;
  fileNamePrefix?: string | null;
  trackInMedia?: boolean;
  meta?: Record<string, unknown>;
};

const MB = 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "application/json": ".json",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-excel": ".xls",
};

const PRESET_RULES: Record<string, Omit<UploadRule, "scope" | "source">> = {
  avatars: {
    folder: "users/avatars",
    maxSize: 2 * MB,
    allowedTypes: IMAGE_TYPES,
    trackInMedia: false,
    kind: "image",
  },
  media: {
    folder: "media",
    maxSize: 10 * MB,
    allowedTypes: [...IMAGE_TYPES, ...DOCUMENT_TYPES],
    trackInMedia: true,
    kind: "mixed",
  },
  posts: {
    folder: "posts",
    maxSize: 10 * MB,
    allowedTypes: IMAGE_TYPES,
    trackInMedia: true,
    kind: "image",
  },
  products: {
    folder: "products",
    maxSize: 10 * MB,
    allowedTypes: IMAGE_TYPES,
    trackInMedia: true,
    kind: "image",
  },
  documents: {
    folder: "documents",
    maxSize: 25 * MB,
    allowedTypes: DOCUMENT_TYPES,
    trackInMedia: true,
    kind: "document",
  },
};

const normalizeScope = (value: string) => {
  const cleaned = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");

  const parts = cleaned
    .split("/")
    .map((part) => part.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .filter((part) => part !== "." && part !== "..");

  return parts.join("/") || "misc";
};

const getFileExtension = (file: File) => {
  const originalExt = path.extname(file.name || "").toLowerCase();
  if (originalExt) return originalExt;
  return EXT_BY_TYPE[file.type] ?? ".bin";
};

const matchesAllowedType = (allowedType: string, actualType: string) => {
  if (allowedType.endsWith("/*")) {
    const prefix = allowedType.slice(0, -1);
    return actualType.startsWith(prefix);
  }
  return allowedType === actualType;
};

export function resolveUploadRule(scope: string, mimeType?: string | null): UploadRule {
  const normalizedScope = normalizeScope(scope);
  const preset = PRESET_RULES[normalizedScope];

  if (preset) {
    return {
      scope: normalizedScope,
      source: "preset",
      ...preset,
    };
  }

  if (mimeType && mimeType.startsWith("image/")) {
    return {
      scope: normalizedScope,
      folder: normalizedScope,
      maxSize: 10 * MB,
      allowedTypes: IMAGE_TYPES,
      trackInMedia: true,
      kind: "image",
      source: "inferred",
    };
  }

  if (mimeType && DOCUMENT_TYPES.includes(mimeType)) {
    return {
      scope: normalizedScope,
      folder: normalizedScope,
      maxSize: 25 * MB,
      allowedTypes: DOCUMENT_TYPES,
      trackInMedia: true,
      kind: "document",
      source: "inferred",
    };
  }

  return {
    scope: normalizedScope,
    folder: normalizedScope,
    maxSize: 25 * MB,
    allowedTypes: mimeType ? [mimeType] : [],
    trackInMedia: true,
    kind: "generic",
    source: "inferred",
  };
}

export function validateProjectUpload(file: File, rule: UploadRule) {
  if (file.size > rule.maxSize) {
    throw new Error(`Tệp vượt quá ${Math.round(rule.maxSize / MB)}MB.`);
  }

  if (
    rule.allowedTypes.length > 0 &&
    !rule.allowedTypes.some((allowedType) => matchesAllowedType(allowedType, file.type))
  ) {
    throw new Error("Định dạng tệp không nằm trong quy tắc upload của khu vực này.");
  }
}

async function createMediaRecord(url: string, file: File, meta: Record<string, unknown>) {
  const { rows, error } = await query<MediaRow>(
    `insert into media (url, type, meta)
     values ($1, $2, $3)
     returning id, url, type, meta, created_at, updated_at`,
    [url, file.type, meta],
  );

  if (error || !rows[0]) {
    throw new Error(error || "Không thể lưu thông tin media.");
  }

  return rows[0];
}

export async function saveProjectUpload({
  scope,
  file,
  fileNamePrefix,
  trackInMedia,
  meta,
}: SaveProjectUploadInput) {
  const rule = resolveUploadRule(scope, file.type);
  validateProjectUpload(file, rule);

  const ext = getFileExtension(file);
  const prefix = normalizeScope(fileNamePrefix || "");
  const safePrefix = prefix && prefix !== "misc" ? `${prefix}-` : "";
  const fileName = `${safePrefix}${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", ...rule.folder.split("/"));
  await mkdir(uploadDir, { recursive: true });

  const absolutePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const url = `/uploads/${rule.folder}/${fileName}`;
  const nextMeta = {
    original_name: file.name,
    size: file.size,
    scope: rule.scope,
    folder: rule.folder,
    upload_kind: rule.kind,
    upload_rule_source: rule.source,
    ...meta,
  };

  const shouldTrack = trackInMedia ?? rule.trackInMedia;
  const media = shouldTrack ? await createMediaRecord(url, file, nextMeta) : null;

  return {
    rule,
    fileName,
    absolutePath,
    url,
    meta: nextMeta,
    media,
  };
}

export async function removeProjectUploadByUrl(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const relativePath = url.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  await rm(absolutePath, { force: true }).catch(() => undefined);
}

export function listUploadRules() {
  return Object.entries(PRESET_RULES).map(([scope, rule]) => ({
    scope,
    ...rule,
  }));
}
