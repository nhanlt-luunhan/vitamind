import Link from "next/link";
import { getHomeFeed } from "@/lib/blog/home";

const PopularCategories = async () => {
  const { categories } = await getHomeFeed();

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-30">
        <h2 className="color-linear d-inline-block mb-10 wow animate__animated animate__fadeInUp">
          Chuyên mục đang có nội dung
        </h2>
        <p className="text-lg color-gray-500 wow animate__animated animate__fadeInUp">
          Truy cập nhanh vào các nhóm bài viết chính của Vitamind
        </p>
        <div className="row mt-70 mb-50">
          {categories.slice(0, 8).map((item, index) => (
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12" key={item.slug}>
              <div
                className="card-style-2 hover-up hover-neon wow animate__animated animate__fadeIn"
                data-wow-delay={`${index / 10}s`}
              >
                <div className="card-image">
                  <span className="fi-rr-apps color-linear" aria-hidden="true" />
                </div>
                <div className="card-info">
                  <Link className="color-gray-500" href={item.href}>
                    {item.title}
                  </Link>
                  <p className="text-xs color-gray-700 mt-10">{item.postCount} bài viết</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export { PopularCategories };
