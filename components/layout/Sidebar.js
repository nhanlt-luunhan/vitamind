import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { getHomeFeed, formatPostDate } from "@/lib/blog/home";

const FALLBACK_IMAGE = "/assets/imgs/page/healthy/img.png";

const Sidebar = async () => {
  const { posts, categories, tags } = await getHomeFeed();
  const latestPosts = posts.slice(0, 4);

  return (
    <div className="sidebar">
      <div className="box-sidebar bg-gray-850 border-gray-800">
        <div className="head-sidebar wow animate__animated animate__fadeIn">
          <h5 className="line-bottom">Bài viết mới</h5>
        </div>
        <div className="content-sidebar">
          <div className="list-posts">
            {latestPosts.map((post, index) => (
              <div
                className="item-post wow animate__animated animate__fadeIn"
                data-wow-delay={`${index / 10}s`}
                key={post.slug}
              >
                <div className="image-post">
                  <Link href={`/blog/${post.slug}`}>
                    <Image
                      width={64}
                      height={64}
                      src={post.cover_image ?? FALLBACK_IMAGE}
                      alt={post.title}
                    />
                  </Link>
                </div>
                <div className="info-post border-gray-800">
                  <Link href={`/blog/${post.slug}`}>
                    <h6 className="color-white">{post.title}</h6>
                  </Link>
                  <span className="color-gray-700">{post.author ?? "Vitamind"}</span>
                  <ul className="d-inline-block">
                    <li className="color-gray-700">{formatPostDate(post.created_at)}</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="box-sidebar bg-gray-850 border-gray-800">
        <div className="head-sidebar wow animate__animated animate__fadeIn">
          <h5 className="line-bottom">Chuyên mục</h5>
        </div>
        <div className="content-sidebar">
          <div className="list-posts">
            {categories.slice(0, 6).map((category, index) => (
              <div
                className="item-post wow animate__animated animate__fadeIn"
                data-wow-delay={`${index / 10}s`}
                key={category.slug}
              >
                <div className="info-post border-gray-800">
                  <Link href={category.href}>
                    <h6 className="color-white">{category.title}</h6>
                  </Link>
                  <span className="color-gray-700">{category.postCount} bài viết</span>
                  <ul className="d-inline-block">
                    <li className="color-gray-700">{category.latestTitle}</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="box-sidebar bg-gray-850 border-gray-800">
          <div className="head-sidebar">
            <BrandLogo variant="dark" compact />
            <h6 className="color-gray-700">Từ khóa nổi bật</h6>
          </div>
          <div className="content-sidebar">
            <div className="row mt-30 mb-10">
              {tags.slice(0, 8).map((tag, index) => (
                <div
                  className="col-sm-6 col-6 mb-20 wow animate__animated animate__fadeIn"
                  data-wow-delay={`${index / 10}s`}
                  key={tag.label}
                >
                  <div className="btn btn-tags bg-gray-900 border-gray-800 w-100 text-start">
                    <span className="color-gray-500">#{tag.label}</span>
                    <small className="d-block color-gray-700 mt-5">{tag.count} bài</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { Sidebar };
