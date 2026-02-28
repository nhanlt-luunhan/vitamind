import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { getHomeFeed, formatPostDate } from "@/lib/blog/home";
import { slugify } from "@/lib/utils/slugify";

const FALLBACK_IMAGE = "/assets/imgs/page/healthy/img.png";

const RecentPosts = async () => {
  const { recentListPosts } = await getHomeFeed();

  if (recentListPosts.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="color-linear d-inline-block mb-10">Bài viết gần đây</h2>
      <p className="text-lg color-gray-500">Nội dung mới nhất được xuất bản trên Vitamind</p>
      <div className="box-list-posts mt-70">
        {recentListPosts.map((post, index) => (
          <div
            className="card-list-posts wow animate__animated animate__fadeIn"
            key={post.slug}
            data-wow-delay={`${index / 10}s`}
          >
            <div className="card-image hover-up">
              <Link href={`/blog/${post.slug}`}>
                <Image
                  width={270}
                  height={257}
                  src={post.cover_image ?? FALLBACK_IMAGE}
                  alt={post.title}
                />
              </Link>
            </div>
            <div className="card-info">
              <Button asChild unstyled className="btn btn-tag bg-gray-800 hover-up">
                <Link href={post.category ? `/category/${slugify(post.category)}` : "/blog"}>
                  {post.category ?? "Blog"}
                </Link>
              </Button>
              <Link href={`/blog/${post.slug}`}>
                <h4 className="mt-15 mb-20 color-white">{post.title}</h4>
              </Link>
              {post.description ? <p className="color-gray-500">{post.description}</p> : null}
              <div className="row mt-20">
                <div className="col-7">
                  {(post.tags ?? []).slice(0, 2).map((tag) => (
                    <span className="color-gray-700 text-sm mr-15" key={tag}>
                      # {tag}
                    </span>
                  ))}
                </div>
                <div className="col-5 text-end">
                  <span className="color-gray-700 text-sm timeread">{formatPostDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export { RecentPosts };
