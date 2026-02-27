import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog/posts";
import { getSiteUrl } from "@/lib/utils/site-url";

export const dynamic = "force-dynamic";

function formatLastMod(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET() {
  const posts = await getAllPosts();
  const siteUrl = getSiteUrl();

  const urls = posts
    .map((post) => {
      const lastMod = formatLastMod(post.updated_at ?? post.created_at);
      return [
        "  <url>",
        `    <loc>${siteUrl}/blog/${encodeURIComponent(post.slug)}</loc>`,
        lastMod ? `    <lastmod>${lastMod}</lastmod>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

