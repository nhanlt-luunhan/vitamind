import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { getHomeFeed, formatPostDate } from "@/lib/blog/home";
import { slugify } from "@/lib/utils/slugify";

const FALLBACK_IMAGE = "/assets/imgs/page/healthy/img.png";

const EditorPicked = async () => {
  const { spotlightPosts } = await getHomeFeed();
  const primaryPosts = spotlightPosts.slice(0, 2);
  const secondaryPosts = spotlightPosts.slice(2, 5);

  if (spotlightPosts.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="color-linear d-inline-block mb-10 wow animate__animated animate__fadeInUp">
        Gợi ý nổi bật
      </h2>
      <p className="text-lg color-gray-500 wow animate__animated animate__fadeInUp">
        Bài viết Vitamind được đọc nhiều và đáng xem trước tiên.
      </p>
      <div className="row mt-70">
        {primaryPosts.map((post, index) => (
          <div className="col-lg-6 wow animate__animated animate__fadeIn" key={post.slug}>
            <div className="card-blog-1 hover-up">
              <div className="card-image mb-20 mh-315 bdr-16">
                <Link className="post-type" href={`/blog/${post.slug}`} />
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    width={484}
                    height={300}
                    src={post.cover_image ?? FALLBACK_IMAGE}
                    alt={post.title}
                  />
                </Link>
              </div>
              <div className="card-info">
                <div className="row">
                  <div className="col-7">
                    <Link className="color-gray-700 text-sm" href={post.category ? `/category/${slugify(post.category)}` : "/blog"}>
                      #{post.category ?? "Blog"}
                    </Link>
                  </div>
                  <div className="col-5 text-end">
                    <span className="color-gray-700 text-sm timeread">
                      {formatPostDate(post.created_at)}
                    </span>
                  </div>
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h4 className="color-white mt-20">{post.title}</h4>
                </Link>
                {post.description ? <p className="color-gray-500 mt-15">{post.description}</p> : null}
                <div className="row align-items-center mt-25">
                  <div className="col-7">
                    <div className="box-author">
                      <div className="author-info">
                        <h6 className="color-gray-700">{post.author ?? "Vitamind"}</h6>
                        <span className="color-gray-700 text-sm">{formatPostDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-5 text-end">
                    <Link className="readmore color-gray-500 text-sm" href={`/blog/${post.slug}`}>
                      <span>Đọc thêm</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {secondaryPosts.map((post, index) => (
          <div
            className="col-lg-4 wow animate__animated animate__fadeIn"
            data-wow-delay={`${(index + 1) / 10}s`}
            key={post.slug}
          >
            <div className="card-blog-1 hover-up">
              <div className="card-image mb-20 mh-200 bdr-16 ">
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
                    <Link className="color-gray-700 text-sm" href={post.category ? `/category/${slugify(post.category)}` : "/blog"}>
                      #{post.category ?? "Blog"}
                    </Link>
                  </div>
                  <div className="col-5 text-end">
                    <span className="color-gray-700 text-sm timeread">
                      {formatPostDate(post.created_at)}
                    </span>
                  </div>
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h5 className="color-white mt-20">{post.title}</h5>
                </Link>
                {post.description ? <p className="color-gray-500 mt-15">{post.description}</p> : null}
                <div className="row align-items-center mt-25">
                  <div className="col-7">
                    <div className="box-author">
                      <div className="author-info">
                        <h6 className="color-gray-700">{post.author ?? "Vitamind"}</h6>
                        <span className="color-gray-700 text-sm">{formatPostDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-5 text-end">
                    <Link className="readmore color-gray-500 text-sm" href={`/blog/${post.slug}`}>
                      <span>Đọc thêm</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mb-50">
        <Button asChild unstyled className="btn btn-linear btn-load-more wow animate__animated animate__zoomIn">
          <Link href="/blog">
            Xem toàn bộ bài viết
            <i className="fi-rr-arrow-small-right" />
          </Link>
        </Button>
      </div>
    </>
  );
};

export { EditorPicked };
