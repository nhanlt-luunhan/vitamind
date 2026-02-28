import Link from "next/link";
import Image from "next/image";
import data from "@/content/blogData2";
import comments from "@/content/commentsData";
import gallery from "@/content/galleryData";
import { BrandLogo } from "@/components/layout/BrandLogo";

const Sidebar = ({ openClass }) => {
  return (
    <>
      <div className="sidebar">
        <div className="box-sidebar bg-gray-850 border-gray-800">
          <div className="head-sidebar wow animate__animated animate__fadeIn">
            <h5 className="line-bottom">Bài viết nổi bật</h5>
          </div>
          <div className="content-sidebar">
            <div className="list-posts">
              {data.slice(0, 5).map((item, i) => (
                <div
                  className="item-post wow animate__animated animate__fadeIn"
                  data-wow-delay={`${i / 10}s`}
                  key={i}
                >
                  <div className="image-post">
                    <Link href={`/blog/${item.id}`}>
                      <Image
                        width={64}
                        height={64}
                        src={`/assets/imgs/page/healthy/${item.img}`}
                        alt="Vitamind"
                      />
                    </Link>
                  </div>
                  <div className="info-post border-gray-800">
                    <Link href={`/blog/${item.id}`}>
                      <h6 className="color-white">{item.title}</h6>
                    </Link>
                    <span className="color-gray-700">{item.duration} phút đọc</span>
                    <ul className="d-inline-block">
                      <li className="color-gray-700">{item.date}</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="box-sidebar bg-gray-850 border-gray-800">
          <div className="head-sidebar wow animate__animated animate__fadeIn">
            <h5 className="line-bottom">Bình luận mới nhất</h5>
          </div>
          <div className="content-sidebar">
            <div className="list-comments">
              {comments.slice(0, 3).map((item, i) => (
                <div
                  className="item-comment border-gray-800 wow animate__animated animate__fadeIn"
                  data-wow-delay={`${i / 10}s`}
                  key={i}
                >
                  <p className="color-gray-500 mb-20">“{item.content}”</p>
                  <div className="box-author-small">
                    <Image
                      width={32}
                      height={32}
                      src={`/assets/imgs/page/homepage1/${item.authorAvata}`}
                      alt="Vitamind"
                    />
                    <div className="author-info">
                      <span className="d-block color-gray-700 text-sm">{item.authorName}</span>
                      <span className="color-gray-700 text-xs">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="box-sidebar bg-gray-850 border-gray-800">
          <div className="head-sidebar">
            <BrandLogo variant="dark" compact />
            <h6 className="color-gray-700">Theo dõi chúng tôi trên Instagram</h6>
          </div>
          <div className="content-sidebar">
            <div className="row mt-30 mb-10">
              {gallery.slice(0, 9).map((item, i) => (
                <div
                  className="col-sm-4 col-4 mb-20 wow animate__animated animate__fadeIn"
                  data-wow-delay={`${i / 10}s`}
                  key={i}
                >
                  <Link href={`${item.link}`}>
                    <Image
                      width={80}
                      height={80}
                      className="bdrd-8"
                      src={`/assets/imgs/page/homepage1/${item.img}`}
                      alt="Vitamind"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Sidebar };
