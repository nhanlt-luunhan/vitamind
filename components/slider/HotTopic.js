import Link from "next/link";
import Image from "next/image";
import { getHomeFeed } from "@/lib/blog/home";

const HotTopic = async () => {
  const { categories } = await getHomeFeed();
  const hotCategories = categories.slice(0, 4);

  if (hotCategories.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-60 mb-50">
        <div className="text-center mb-40">
          <h2 className="color-linear mb-10">Chủ đề nổi bật</h2>
          <p className="text-lg color-gray-500">Những chuyên mục đang có nội dung mới và đáng xem</p>
        </div>
        <div className="row">
          {hotCategories.map((item, index) => (
            <div className="col-lg-3 col-md-6 mb-30" key={item.slug}>
              <div className="card-style-1 hover-up">
                <Link href={item.href}>
                  <div className="card-image">
                    <Image
                      width={246}
                      height={303}
                      src={item.coverImage}
                      alt={item.title}
                    />
                    <div className="card-info">
                      <div className="info-bottom">
                        <h6 className="color-white mb-5">{item.title}</h6>
                        <p className="text-xs color-gray-500">{item.postCount} bài viết</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export { HotTopic };
