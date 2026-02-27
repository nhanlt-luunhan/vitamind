import Link from "next/link";
import Image from "next/image";
import categories from "@/content/categoriesData";

const HotTopic = () => {
  return (
    <>
      <div className="mt-60 mb-50">
        <div className="text-center mb-40">
          <h2 className="color-linear mb-10">Chủ đề nổi bật</h2>
          <p className="text-lg color-gray-500">Được quan tâm nhiều nhất tuần này</p>
        </div>
        <div className="row">
          {categories.slice(0, 4).map((item, i) => (
            <div className="col-lg-3 col-md-6 mb-30" key={i}>
              <div className="card-style-1 hover-up">
                <Link href="/blog">
                  <div className="card-image">
                    <Image
                      width={246}
                      height={303}
                      src={`/assets/imgs/page/categories/${item.imgBig}`}
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
