import Image from "next/image";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui";
import { getAllCategorySlugs, getPostsByCategorySlug } from "@/lib/blog/posts";
import { slugify } from "@/lib/utils/slugify";

export const revalidate = 60;

const FALLBACK_IMAGE = "/assets/imgs/page/healthy/img.png";

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { posts, categoryName } = await getPostsByCategorySlug(slug);
  const featured = posts[0];
  const secondary = posts.slice(1, 4);
  const rest = posts.slice(4);

  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="mt-70">
                <div className="d-flex flex-column align-items-start">
                  <div className="blog-meta-bar">
                    <span className="blog-meta-chip">{categoryName}</span>
                    <span className="blog-meta-dot" />
                    <span className="blog-meta-count">{posts.length} bài viết</span>
                  </div>
                  <h2 className="color-linear d-inline-block mt-20 mb-10">{categoryName}</h2>
                </div>
                <p className="text-lg color-gray-500">
                  Tổng hợp các bài viết mới nhất trong danh mục này.
                </p>
                <Link href="/blog" className="color-gray-500 text-sm">
                  ← Xem tất cả bài viết
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="mt-70">
                  <p className="color-gray-500">Chưa có bài viết trong danh mục này.</p>
                </div>
              ) : (
                <>
                  <div className="row mt-60">
                    <div className="col-lg-7">
                      {featured ? (
                        <div className="card-blog-1 card-blog-2 hover-up wow animate__animated animate__fadeIn">
                          <div className="card-image mb-20">
                            <Link className="post-type" href={`/blog/${featured.slug}`} />
                            <Link href={`/blog/${featured.slug}`}>
                              <Image
                                width={615}
                                height={382}
                                src={featured.cover_image ?? FALLBACK_IMAGE}
                                alt={featured.title}
                              />
                            </Link>
                          </div>
                          <div className="card-info">
                            <Link href={`/blog/${featured.slug}`}>
                              <h4 className="color-white mt-30">{featured.title}</h4>
                            </Link>
                            {featured.description ? (
                              <p className="mt-25 text-lg color-gray-700">{featured.description}</p>
                            ) : null}
                            <div className="row align-items-center mt-45">
                              <div className="col-7">
                                <div className="box-author">
                                  <Image
                                    width={48}
                                    height={48}
                                    src="/assets/imgs/page/homepage1/author.png"
                                    alt="Author"
                                  />
                                  <div className="author-info">
                                    <h6 className="color-gray-700">
                                      {featured.author ?? "Vitamind"}
                                    </h6>
                                    <span className="color-gray-700 text-sm">
                                      {formatDate(featured.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-5 text-end">
                                <Link
                                  className="readmore color-gray-500 text-sm"
                                  href={`/category/${slugify(categoryName)}`}
                                >
                                  <span>Xem danh mục</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="col-lg-5">
                      <div className="row">
                        {secondary.map((post, index) => (
                          <div className="col-lg-12" key={post.id}>
                            <div
                              className="card-list-posts card-list-posts-small mb-30 wow animate__animated animate__fadeIn"
                              data-wow-delay={`${index / 10}s`}
                            >
                              <div className="card-image hover-up">
                                <Link href={`/blog/${post.slug}`}>
                                  <Image
                                    width={170}
                                    height={160}
                                    src={post.cover_image ?? FALLBACK_IMAGE}
                                    alt={post.title}
                                  />
                                </Link>
                              </div>
                              <div className="card-info">
                                <Button
                                  asChild
                                  unstyled
                                  className="btn btn-tag bg-gray-800 hover-up mb-10 text-xs"
                                >
                                  <Link href={`/category/${slugify(categoryName)}`}>
                                    {categoryName}
                                  </Link>
                                </Button>
                                <Link href={`/blog/${post.slug}`}>
                                  <h5 className="mb-10 color-white">{post.title}</h5>
                                </Link>
                                <div className="row mt-10">
                                  <div className="col-12">
                                    <span className="calendar-icon color-gray-700 text-sm mr-20">
                                      {formatDate(post.created_at)}
                                    </span>
                                    <span className="color-gray-700 text-sm timeread">
                                      {formatDate(post.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {rest.length > 0 ? (
                    <div className="row mt-40">
                      {rest.map((post, index) => (
                        <div className="col-lg-4" key={post.id}>
                          <div
                            className="card-blog-1 hover-up mb-40 wow animate__animated animate__fadeIn"
                            data-wow-delay={`${index / 10}s`}
                          >
                            <div className="card-image mb-20 mh-200 bdr-16">
                              <Link className="post-type" href={`/blog/${post.slug}`} />
                              <Link href={`/blog/${post.slug}`}>
                                <Image
                                  width={300}
                                  height={270}
                                  src={post.cover_image ?? FALLBACK_IMAGE}
                                  alt={post.title}
                                />
                              </Link>
                            </div>
                            <div className="card-info">
                              <div className="row">
                                <div className="col-7">
                                  <Link
                                    className="color-gray-700 text-sm"
                                    href={`/category/${slugify(categoryName)}`}
                                  >
                                    #{categoryName}
                                  </Link>
                                </div>
                                <div className="col-5 text-end">
                                  <span className="color-gray-700 text-sm timeread">
                                    {formatDate(post.created_at)}
                                  </span>
                                </div>
                              </div>
                              <Link href={`/blog/${post.slug}`}>
                                <h5 className="color-white mt-20">{post.title}</h5>
                              </Link>
                              {post.description ? (
                                <p className="color-gray-500">{post.description}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
