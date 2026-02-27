import { Pool } from "pg";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const connectionString = process.env.DATABASE_URL;
if (!connectionString && !isBuildPhase) {
  throw new Error("DATABASE_URL is not set");
}

type GlobalWithPg = typeof globalThis & { pgPool?: Pool };

const globalForPg = globalThis as GlobalWithPg;

const pool = connectionString
  ? (globalForPg.pgPool ?? new Pool({ connectionString, max: 10 }))
  : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  cover_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  published: boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

export type PostSummary = Omit<Post, "content" | "published">;

type CreatePostInput = {
  title: string;
  slug?: string;
  description?: string | null;
  content: string;
  cover_image?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string[] | null;
  published?: boolean;
};

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!pool) return null;
  const { rows } = await pool.query<Post>(
    `
      select
        id,
        title,
        slug,
        description,
        content,
        cover_image,
        author,
        category,
        tags,
        published,
        created_at,
        updated_at
      from posts
      where published = true
        and slug = $1
      limit 1
    `,
    [slug],
  );

  return rows[0] ?? null;
}

export async function getAllPosts(): Promise<PostSummary[]> {
  if (!pool) return [];
  const { rows } = await pool.query<PostSummary>(
    `
      select
        id,
        title,
        slug,
        description,
        cover_image,
        author,
        category,
        tags,
        created_at,
        updated_at
      from posts
      where published = true
      order by created_at desc
    `,
  );

  return rows;
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  if (!pool) {
    throw new Error("Database is not available");
  }
  const { rows } = await pool.query<{ slug: string }>(`select slug from posts where slug like $1`, [
    `${baseSlug}%`,
  ]);

  if (rows.length === 0) return baseSlug;

  const existing = new Set(rows.map((row) => row.slug));
  if (!existing.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (existing.has(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  return `${baseSlug}-${counter}`;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  if (!pool) {
    throw new Error("Database is not available");
  }
  const { slugify } = await import("../utils/slugify");
  const baseSlug = input.slug ? input.slug : slugify(input.title);
  const slug = await getUniqueSlug(baseSlug);

  const { rows } = await pool.query<Post>(
    `\n      insert into posts (\n        title,\n        slug,\n        description,\n        content,\n        cover_image,\n        author,\n        category,\n        tags,\n        published\n      )\n      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)\n      returning\n        id,\n        title,\n        slug,\n        description,\n        content,\n        cover_image,\n        author,\n        category,\n        tags,\n        published,\n        created_at,\n        updated_at\n    `,
    [
      input.title,
      slug,
      input.description ?? null,
      input.content,
      input.cover_image ?? null,
      input.author ?? null,
      input.category ?? null,
      input.tags ?? null,
      input.published ?? true,
    ],
  );

  return rows[0];
}
