import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui";
import { CodeCopy } from "@/components/code";
import { BlogToc } from "@/components/blog/BlogToc";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog/posts";
import { getSiteUrl } from "@/lib/utils/site-url";
import { slugify } from "@/lib/utils/slugify";

export const revalidate = 60;

const FALLBACK_IMAGE = "/assets/imgs/page/healthy/img.png";

type PageParams = {
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();
  const description = post.description ?? "";

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: post.title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
    twitter: {
      card: post.cover_image ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();
  const categorySlug = post.category ? slugify(post.category) : "blog";
  const summary = post.summary;
  const coverWidth = post.cover_width ?? 1000;
  const coverHeight = post.cover_height ?? 560;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.cover_image ? [post.cover_image] : undefined,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author,
        }
      : undefined,
    datePublished: post.created_at ? new Date(post.created_at).toISOString() : undefined,
    dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
  };

  return (
    <Layout>
      <CodeCopy />
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="mt-70">
                <div className="d-flex flex-column align-items-start">
                  <div className="blog-meta-bar">
                    <span className="blog-meta-chip">{post.category ?? "Blog"}</span>
                    <span className="blog-meta-dot" />
                    <span className="blog-meta-count">{post.author ?? "Vitamind"}</span>
                  </div>
                  <h2 className="color-linear d-inline-block mt-20 mb-10">{post.title}</h2>
                </div>
                {post.description ? (
                  <p className="text-lg color-gray-500">{post.description}</p>
                ) : null}
                <div className="row align-items-center mt-25">
                  <div className="col-7">
                    <div className="box-author">
                      <Image
                        width={48}
                        height={48}
                        src="/assets/imgs/page/homepage1/author.png"
                        alt="Author"
                      />
                      <div className="author-info">
                        <h6 className="color-gray-700">{post.author ?? "Vitamind"}</h6>
                        <span className="color-gray-700 text-sm">
                          {post.created_at
                            ? new Date(post.created_at).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-5 text-end">
                    <Link
                      className="readmore color-gray-500 text-sm"
                      href={`/category/${categorySlug}`}
                    >
                      <span>Xem danh mục</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-40">
                <Image
                  width={coverWidth}
                  height={coverHeight}
                  className="img-bdrd-16"
                  src={post.cover_image ?? FALLBACK_IMAGE}
                  alt={post.title}
                />
              </div>

              {summary ? (
                <div className="box-summary">
                  {Array.isArray(summary) ? (
                    <ul className="box-summary__list">
                      {summary.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-lg color-gray-500">{summary}</p>
                  )}
                </div>
              ) : null}

              <div className="blog-article-layout mt-40">
                <div className="blog-article-main">
                  <div
                    className="content-detail border-gray-800 text-lg"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                  />

                  {post.tags && post.tags.length > 0 ? (
                    <div className="box-tags">
                      {post.tags.map((tag) => (
                        <Button
                          asChild
                          unstyled
                          className="btn btn-tags bg-gray-850 border-gray-800 mr-10 hover-up"
                          key={tag}
                        >
                          <Link href={`/category/${categorySlug}`}>#{tag}</Link>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <BlogToc items={post.toc} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Layout>
  );
}
