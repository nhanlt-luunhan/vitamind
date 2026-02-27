import Link from "next/link";
import Image from "next/image";
import data from "@/content/blogData2";
import { Button } from "@/components/ui";

const EditorPicked2 = () => {
  return (
    <>
      <div className="row mt-70">
        <h2 className="color-linear d-inline-block mb-10 wow animate__animated animate__fadeInUp">
          Gợi ý biên tập
        </h2>
        <p className="text-lg color-gray-500 wow animate__animated animate__fadeInUp">
          Bài viết nổi bật và được đánh giá cao
        </p>
        <div className="row mt-70">
          {data.slice(0, 4).map((item, i) => (
            <div
              className="col-lg-6 wow animate__animated animate__fadeIn"
              data-wow-delay={`${i / 10}s`}
              key={i}
            >
              <div className="card-blog-1 hover-up">
                <div className="card-image mb-20">
                  <Link className="post-type" href={`/blog/${item.id}`} />
                  <Link href={`/blog/${item.id}`}>
                    <Image
                      width={470}
                      height={292}
                      src={`/assets/imgs/page/homepage2/${item.img}`}
                      alt="Genz"
                    />
                  </Link>
                </div>
                <div className="card-info">
                  <div className="row">
                    <div className="col-7">
                      <Link className="color-gray-700 text-sm" href="/blog">
                        #Travel
                      </Link>
                    </div>
                    <div className="col-5 text-end">
                      <span className="color-gray-700 text-sm timeread">
                        {item.duration} mins read
                      </span>
                    </div>
                  </div>
                  <Link href={`/blog/${item.id}`}>
                    <h4 className="color-white mt-20">Bạn đã sẵn sàng trở về sau hoàng hôn?</h4>
                  </Link>
                  <div className="row align-items-center mt-25">
                    <div className="col-7">
                      <div className="box-author">
                        <Image
                          width={48}
                          height={48}
                          src="/assets/imgs/page/homepage1/author.jpg"
                          alt="Genz"
                        />
                        <div className="author-info">
                          <h6 className="color-gray-700">Joseph</h6>
                          <span className="color-gray-700 text-sm">25 April 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-5 text-end">
                      <Link className="readmore color-gray-500 text-sm" href={`/blog/${item.id}`}>
                        <span>Đọc thêm</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-30">
          <Button
            asChild
            unstyled
            className="btn btn-linear btn-load-more wow animate__animated animate__zoomIn"
          >
            <Link href="/blog">
              Xem thêm bài viết
              <i className="fi-rr-arrow-small-right" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export { EditorPicked2 };
