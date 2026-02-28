import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog/posts";
import { query } from "@/lib/db/admin-db";
import { slugify } from "@/lib/utils/slugify";

export const dynamic = "force-dynamic";

type SearchItem = {
  href: string;
  title: string;
  excerpt: string;
  meta?: string;
};

type ProductRow = {
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  sku: string | null;
  price: string | number | null;
};

const SITE_PAGES = [
  {
    href: "/",
    title: "Trang chủ",
    excerpt: "Khám phá các bài viết, chủ đề công nghệ, lối sống và nội dung nổi bật trên Vitamind.",
    keywords: ["trang chủ", "vitamind", "blog", "tin mới"],
  },
  {
    href: "/blog",
    title: "Bài viết",
    excerpt: "Tổng hợp toàn bộ bài viết mới nhất theo từng chuyên mục và chủ đề.",
    keywords: ["blog", "bài viết", "tin tức", "chuyên mục"],
  },
  {
    href: "/shop",
    title: "Sản phẩm",
    excerpt: "Duyệt danh sách sản phẩm và nội dung liên quan đến hệ sinh thái Vitamind.",
    keywords: ["shop", "sản phẩm", "cửa hàng", "thiết bị"],
  },
  {
    href: "/sign-in",
    title: "Đăng nhập",
    excerpt: "Truy cập tài khoản để đồng bộ hồ sơ và sử dụng các tính năng cá nhân.",
    keywords: ["đăng nhập", "tài khoản", "clerk", "truy cập"],
  },
  {
    href: "/sign-up",
    title: "Đăng ký",
    excerpt: "Tạo tài khoản mới để lưu hồ sơ, bài viết và hoạt động cá nhân.",
    keywords: ["đăng ký", "tạo tài khoản", "tham gia"],
  },
] as const;

function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFC")
    .toLowerCase()
    .trim();
}

function matches(term: string, values: Array<unknown>) {
  return values.some((value) => normalize(value).includes(term));
}

function createExcerpt(value: unknown, fallback: string, maxLength = 120) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function formatPrice(value: string | number | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(parsed);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const term = normalize(q);

  if (term.length < 2) {
    return NextResponse.json({
      query: q,
      pages: [] as SearchItem[],
      categories: [] as SearchItem[],
      posts: [] as SearchItem[],
      products: [] as SearchItem[],
    });
  }

  const [posts, productResult] = await Promise.all([
    getAllPosts(),
    query<ProductRow>(
      `select slug, name, brand, category, sku, price
       from products
       where deleted_at is null
         and lower(coalesce(status, 'published')) not in ('draft', 'private', 'archived')
         and (
           name ilike $1
           or slug ilike $1
           or coalesce(brand, '') ilike $1
           or coalesce(category, '') ilike $1
           or coalesce(sku, '') ilike $1
         )
       order by created_at desc
       limit 6`,
      [`%${q}%`],
    ),
  ]);

  const pages = SITE_PAGES.filter((item) =>
    matches(term, [item.title, item.excerpt, ...item.keywords]),
  )
    .slice(0, 4)
    .map<SearchItem>((item) => ({
      href: item.href,
      title: item.title,
      excerpt: item.excerpt,
      meta: "Trang thông tin",
    }));

  const categoryCounts = new Map<string, { name: string; count: number }>();
  for (const post of posts) {
    if (!post.category) continue;
    const key = slugify(post.category);
    const current = categoryCounts.get(key);
    if (current) {
      current.count += 1;
    } else {
      categoryCounts.set(key, { name: post.category, count: 1 });
    }
  }

  const categories = Array.from(categoryCounts.entries())
    .filter(([, value]) => matches(term, [value.name]))
    .slice(0, 4)
    .map<SearchItem>(([slug, value]) => ({
      href: `/category/${slug}`,
      title: value.name,
      excerpt: `Chuyên mục đang có ${value.count} bài viết công khai.`,
      meta: "Chuyên mục",
    }));

  const postItems = posts
    .filter((post) =>
      matches(term, [post.title, post.description, post.category, post.author, ...(post.tags ?? [])]),
    )
    .slice(0, 6)
    .map<SearchItem>((post) => ({
      href: `/blog/${post.slug}`,
      title: post.title,
      excerpt: createExcerpt(
        post.description,
        `Bài viết trong chuyên mục ${post.category ?? "Vitamind"}.`,
      ),
      meta: post.category ?? "Bài viết",
    }));

  const products = productResult.rows.map<SearchItem>((item) => ({
    href: `/shop/${item.slug}`,
    title: item.name,
    excerpt: createExcerpt(
      [item.brand, item.category, item.sku].filter(Boolean).join(" • "),
      "Sản phẩm trong cửa hàng Vitamind.",
      100,
    ),
    meta: formatPrice(item.price) ?? item.category ?? "Sản phẩm",
  }));

  return NextResponse.json({
    query: q,
    pages,
    categories,
    posts: postItems,
    products,
  });
}
