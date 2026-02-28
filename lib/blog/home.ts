import { getAllPosts, type PostSummary } from "@/lib/blog/posts";
import { slugify } from "@/lib/utils/slugify";

const FALLBACK_IMAGE = "/assets/imgs/page/healthy/img.png";

export type HomeCategorySummary = {
  title: string;
  slug: string;
  href: string;
  description: string;
  postCount: number;
  coverImage: string;
  latestTitle: string;
};

export type HomeTagSummary = {
  label: string;
  count: number;
};

export const formatPostDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

const sortPostsByDate = (left: PostSummary, right: PostSummary) =>
  new Date(right.created_at).getTime() - new Date(left.created_at).getTime();

export async function getHomeFeed() {
  const posts = await getAllPosts();
  const recentPosts = [...posts].sort(sortPostsByDate);
  const spotlightPosts = recentPosts.slice(0, 5);
  const recentListPosts = recentPosts.slice(2, 8).length > 0 ? recentPosts.slice(2, 8) : recentPosts;

  const categoryMap = new Map<string, HomeCategorySummary>();
  const tagMap = new Map<string, number>();

  for (const post of recentPosts) {
    const category = post.category?.trim();
    if (category && !categoryMap.has(category)) {
      categoryMap.set(category, {
        title: category,
        slug: slugify(category),
        href: `/category/${slugify(category)}`,
        description: post.description ?? `Khám phá các bài viết mới nhất về ${category.toLowerCase()}.`,
        postCount: 0,
        coverImage: post.cover_image ?? FALLBACK_IMAGE,
        latestTitle: post.title,
      });
    }

    if (category) {
      const current = categoryMap.get(category);
      if (current) {
        current.postCount += 1;
      }
    }

    for (const tag of post.tags ?? []) {
      const label = tag.trim();
      if (!label) continue;
      tagMap.set(label, (tagMap.get(label) ?? 0) + 1);
    }
  }

  const categories = Array.from(categoryMap.values()).sort((left, right) => {
    if (right.postCount !== left.postCount) return right.postCount - left.postCount;
    return left.title.localeCompare(right.title, "vi");
  });

  const tags = Array.from(tagMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return left.label.localeCompare(right.label, "vi");
    });

  return {
    posts: recentPosts,
    spotlightPosts,
    recentListPosts,
    categories,
    tags,
  };
}
