import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { slugify } from "../utils/slugify";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "content", "posts");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHeadingText = (value: string) =>
  value.replace(/<[^>]*>/g, "").replace(/[`*_~]/g, "").trim();

const createHeadingId = (rawText: string, counts: Map<string, number>) => {
  const base = slugify(stripHeadingText(rawText)) || "section";
  const current = counts.get(base) ?? 0;
  counts.set(base, current + 1);
  return current === 0 ? base : `${base}-${current + 1}`;
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const parsePngSize = (buffer: Buffer) => {
  if (buffer.length < 24) return null;
  const signature = buffer.subarray(0, 8);
  const expected = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!signature.equals(expected)) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return width && height ? { width, height } : null;
};

const parseJpegSize = (buffer: Buffer) => {
  if (buffer.length < 4) return null;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 3 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd9 || marker === 0xda) break;
    const size = buffer.readUInt16BE(offset);
    if (size < 2) return null;
    if (marker >= 0xc0 && marker <= 0xc3) {
      if (offset + 7 >= buffer.length) return null;
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return width && height ? { width, height } : null;
    }
    offset += size;
  }
  return null;
};

const getLocalImageSize = async (source?: string | null) => {
  if (!source || !source.startsWith("/")) return null;
  const filePath = path.join(PUBLIC_DIR, source.replace(/^\/+/, ""));
  const ext = path.extname(filePath).toLowerCase();
  try {
    const buffer = await fs.readFile(filePath);
    if (ext === ".png") return parsePngSize(buffer);
    if (ext === ".jpg" || ext === ".jpeg") return parseJpegSize(buffer);
  } catch (error) {
    return null;
  }
  return null;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

const buildTocAndIds = (content: string) => {
  const tokens = marked.lexer(content);
  const counts = new Map<string, number>();
  const toc: TocItem[] = [];
  const headingIds: string[] = [];

  for (const token of tokens) {
    if (token.type !== "heading") continue;
    const rawText = "text" in token ? String(token.text) : "";
    const id = createHeadingId(rawText, counts);
    headingIds.push(id);
    if (token.depth >= 2 && token.depth <= 4) {
      toc.push({
        id,
        text: stripHeadingText(rawText),
        level: token.depth,
      });
    }
  }

  return { toc, headingIds };
};

const createRenderer = (headingIds: string[], stepById: Map<string, number>) => {
  const renderer = new marked.Renderer();
  const fallbackCounts = new Map<string, number>();

  renderer.code = ({ text, lang }) => {
    const language = lang?.match(/\S+/)?.[0] ?? "text";
    const escaped = escapeHtml(text);
    const encoded = encodeURIComponent(text);

    return [
      `<div class="code-block" data-lang="${language}">`,
      '  <div class="code-block__header">',
      `    <span class="code-block__lang">${language}</span>`,
      `    <button class="code-block__copy" type="button" data-code="${encoded}">Copy</button>`,
      "  </div>",
      `  <pre><code class="language-${language}">${escaped}</code></pre>`,
      "</div>",
    ].join("\n");
  };

  renderer.heading = ({ text, depth }) => {
    const id = headingIds.shift() ?? createHeadingId(text, fallbackCounts);
    if (depth === 2) {
      const step = stepById.get(id);
      const stepMarkup = step ? `<span class="blog-step-index">${step}</span>` : "";
      return `<h2 id="${id}" class="blog-step-heading">${stepMarkup}<span class="blog-step-text">${text}</span></h2>`;
    }
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  return renderer;
};

type PostFrontmatter = {
  title?: string;
  description?: string;
  summary?: string | string[];
  ai_summary?: string | string[];
  date?: string | Date;
  updated?: string | Date;
  category?: string;
  author?: string;
  tags?: string[] | string;
  cover_image?: string;
  cover_width?: number | string;
  cover_height?: number | string;
  published?: boolean;
  slug?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  summary: string | string[] | null;
  content: string;
  contentHtml: string;
  toc: TocItem[];
  cover_image: string | null;
  cover_width: number | null;
  cover_height: number | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string | null;
};

export type PostSummary = Omit<Post, "content" | "contentHtml" | "toc">;
export type PostAdmin = PostSummary & { fileName: string };

function toIsoDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeTags(value: PostFrontmatter["tags"]) {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.filter((tag) => typeof tag === "string" && tag.trim().length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return null;
}

function normalizeSummary(value: PostFrontmatter["summary"]) {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return null;
}

async function listPostFiles() {
  const entries = await fs.readdir(POSTS_DIR);
  return entries.filter((file) => {
    if (!(file.endsWith(".md") || file.endsWith(".mdx"))) return false;
    const lower = file.toLowerCase();
    if (lower === "readme.md" || lower === "readme.mdx") return false;
    if (file.startsWith("_") || file.startsWith(".")) return false;
    return true;
  });
}

async function loadPostFromFile(fileName: string, includeContentHtml: boolean): Promise<Post> {
  const filePath = path.join(POSTS_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;
  const baseTitle = frontmatter.title ?? path.parse(fileName).name;
  const slug = frontmatter.slug ? slugify(frontmatter.slug) : slugify(baseTitle);
  const createdAt = toIsoDate(frontmatter.date);
  const updatedAt = toIsoDate(frontmatter.updated);
  const stats = createdAt ? null : await fs.stat(filePath);
  const createdAtIso = createdAt ?? stats?.mtime.toISOString() ?? new Date().toISOString();
  const summary = normalizeSummary(frontmatter.summary ?? frontmatter.ai_summary);
  const coverImage = frontmatter.cover_image ?? null;
  const coverWidth = normalizeNumber(frontmatter.cover_width);
  const coverHeight = normalizeNumber(frontmatter.cover_height);
  const localSize =
    coverWidth && coverHeight ? null : await getLocalImageSize(coverImage);
  const resolvedWidth = coverWidth ?? localSize?.width ?? null;
  const resolvedHeight = coverHeight ?? localSize?.height ?? null;
  const { toc, headingIds } = includeContentHtml
    ? buildTocAndIds(content)
    : { toc: [], headingIds: [] };
  const stepById = new Map<string, number>();
  let stepIndex = 0;
  for (const item of toc) {
    if (item.level !== 2) continue;
    stepIndex += 1;
    stepById.set(item.id, stepIndex);
  }

  const contentHtml = includeContentHtml
    ? await marked.parse(content, {
        renderer: createRenderer([...headingIds], stepById),
      })
    : "";

  return {
    id: slug,
    title: baseTitle,
    slug,
    description: frontmatter.description ?? null,
    summary,
    content: content.trim(),
    contentHtml,
    toc,
    cover_image: coverImage,
    cover_width: resolvedWidth,
    cover_height: resolvedHeight,
    author: frontmatter.author ?? null,
    category: frontmatter.category ?? null,
    tags: normalizeTags(frontmatter.tags),
    published: frontmatter.published ?? true,
    created_at: createdAtIso,
    updated_at: updatedAt,
  };
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const files = await listPostFiles();
  const posts = await Promise.all(files.map((file) => loadPostFromFile(file, false)));
  const published = posts.filter((post) => post.published);
  const slugSet = new Set<string>();
  for (const post of published) {
    if (slugSet.has(post.slug)) {
      throw new Error(`Duplicate post slug detected: ${post.slug}`);
    }
    slugSet.add(post.slug);
  }
  published.sort((a, b) => {
    const left = new Date(a.created_at).getTime();
    const right = new Date(b.created_at).getTime();
    return right - left;
  });
  return published;
}

export async function getAllPostsAdmin(): Promise<PostAdmin[]> {
  const files = await listPostFiles();
  const posts = await Promise.all(
    files.map(async (file) => ({
      ...(await loadPostFromFile(file, false)),
      fileName: file,
    })),
  );
  const slugSet = new Set<string>();
  for (const post of posts) {
    if (slugSet.has(post.slug)) {
      throw new Error(`Duplicate post slug detected: ${post.slug}`);
    }
    slugSet.add(post.slug);
  }
  posts.sort((a, b) => {
    const left = new Date(a.created_at).getTime();
    const right = new Date(b.created_at).getTime();
    return right - left;
  });
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const files = await listPostFiles();
  for (const file of files) {
    const post = await loadPostFromFile(file, true);
    if (post.slug === slug && post.published) {
      return post;
    }
  }
  return null;
}

type PostUpdateInput = Partial<
  Pick<
    PostFrontmatter,
    | "title"
    | "description"
    | "summary"
    | "ai_summary"
    | "category"
    | "author"
    | "tags"
    | "cover_image"
    | "published"
    | "date"
    | "updated"
  >
>;

const normalizeFrontmatterUpdate = (input: PostUpdateInput) => {
  const next: Record<string, unknown> = { ...input };
  if (input.tags !== undefined) {
    next.tags = normalizeTags(input.tags);
  }
  if (input.summary !== undefined || input.ai_summary !== undefined) {
    const summary = input.summary ?? input.ai_summary;
    const normalized = normalizeSummary(summary);
    if (input.summary !== undefined) next.summary = normalized;
    if (input.ai_summary !== undefined) next.ai_summary = normalized;
  }
  return next;
};

const stripEmptyFrontmatter = (data: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "string" && value.trim().length === 0) continue;
    cleaned[key] = value;
  }
  return cleaned;
};

async function findPostFileBySlug(slug: string) {
  const files = await listPostFiles();
  for (const file of files) {
    const post = await loadPostFromFile(file, false);
    if (post.slug === slug) {
      return { fileName: file, post };
    }
  }
  return null;
}

export async function updatePostFrontmatter(slug: string, updates: PostUpdateInput) {
  const found = await findPostFileBySlug(slug);
  if (!found) return null;

  const filePath = path.join(POSTS_DIR, found.fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const updated = {
    ...parsed.data,
    ...normalizeFrontmatterUpdate(updates),
    updated: new Date().toISOString(),
  } as Record<string, unknown>;
  const cleaned = stripEmptyFrontmatter(updated);
  const nextRaw = matter.stringify(parsed.content, cleaned);
  await fs.writeFile(filePath, nextRaw, "utf8");
  return loadPostFromFile(found.fileName, false);
}

export async function createPostFile(input: {
  title: string;
  description?: string;
  category?: string;
  cover_image?: string;
}) {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  const slug = slugify(title);
  const fileName = `${slug}.md`;
  const filePath = path.join(POSTS_DIR, fileName);

  try {
    await fs.access(filePath);
    throw new Error("File already exists");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const data: Record<string, unknown> = stripEmptyFrontmatter({
    title,
    slug,
    description: input.description,
    category: input.category,
    cover_image: input.cover_image,
    published: false,
    date: new Date().toISOString(),
  });

  const content = `# ${title}\n\n`;
  const raw = matter.stringify(content, data);
  await fs.writeFile(filePath, raw, "utf8");
  return loadPostFromFile(fileName, false);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

export async function getPostsByCategorySlug(slug: string) {
  const posts = await getAllPosts();
  const filtered = posts.filter((post) => post.category && slugify(post.category) === slug);
  const categoryName =
    filtered[0]?.category ??
    slug
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  return { posts: filtered, categoryName };
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  const slugs = new Set<string>();
  for (const post of posts) {
    if (post.category) {
      slugs.add(slugify(post.category));
    }
  }
  return Array.from(slugs);
}
