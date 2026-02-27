import Link from "next/link";
import Image from "next/image";
import data from "@/content/blogData2";
import { Button } from "@/components/ui";

const EditorPicked = () => {
  return (
    <>
      <h2 className="color-linear d-inline-block mb-10 wow animate__animated animate__fadeInUp">
        Gợi ý của biên tập viên
      </h2>
      <p className="text-lg color-gray-500 wow animate__animated animate__fadeInUp">
        Bài viết nổi bật và được đánh giá cao
      </p>
      <div className="row mt-70">
        {data.slice(0, 5).map((item, i) =>
          i < 2 ? (
            <div className="col-lg-6 wow animate__animated animate__fadeIn" key={i}>
              <div className="card-blog-1 hover-up">
                <div className="card-image mb-20 mh-315 bdr-16">
                  <Link className="post-type" href={`/blog/${item.id}`} />
                  <Link href={`/blog/${item.id}`}>
                    <Image
                      width={484}
                      height={300}
                      src={`/assets/imgs/page/healthy/${item.img}`}
                      alt="Genz"
                    />
                  </Link>
                </div>
                <div className="card-info">
                  <div className="row">
                    <div className="col-7">
                      <Link className="color-gray-700 text-sm" href={`/blog/${item.id}`}>
                        {" "}
                        #DuLịch
                      </Link>
                    </div>
                    <div className="col-5 text-end">
                      <span className="color-gray-700 text-sm timeread">
                        {item.duration} phút đọc
                      </span>
                    </div>
                  </div>
                  <Link href={`/blog/${item.id}`}>
                    <h4 className="color-white mt-20">{item.title}</h4>
                  </Link>
                  <div className="row align-items-center mt-25">
                    <div className="col-7">
                      <div className="box-author">
                        <Image
                          width={48}
                          height={48}
                          src="/assets/imgs/page/homepage1/author.png"
                          alt="Genz"
                        />
                        <div className="author-info">
                          <h6 className="color-gray-700">{item.authorname}</h6>
                          <span className="color-gray-700 text-sm">{item.date}</span>
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
          ) : (
            <div
              className="col-lg-4 wow animate__animated animate__fadeIn"
              data-wow-delay=".1s"
              key={i}
            >
              <div className="card-blog-1 hover-up">
                <div className="card-image mb-20 mh-200 bdr-16 ">
                  <Link className="post-type" href={`/blog/${item.id}`} />
                  <Link href={`/blog/${item.id}`}>
                    <Image
                      width={300}
                      height={270}
                      src={`/assets/imgs/page/healthy/${item.img}`}
                      alt="Genz"
                    />
                  </Link>
                </div>
                <div className="card-info">
                  <div className="row">
                    <div className="col-7">
                      <Link className="color-gray-700 text-sm" href={`/blog/${item.id}`}>
                        {" "}
                        #ThiếtKế
                      </Link>
                    </div>
                    <div className="col-5 text-end">
                      <span className="color-gray-700 text-sm timeread">
                        {item.duration} phút đọc
                      </span>
                    </div>
                  </div>
                  <Link href={`/blog/${item.id}`}>
                    <h5 className="color-white mt-20">{item.title}</h5>
                  </Link>
                  <div className="row align-items-center mt-25">
                    <div className="col-7">
                      <div className="box-author">
                        <Image
                          width={48}
                          height={48}
                          src="/assets/imgs/page/homepage1/author3.png"
                          alt="Genz"
                        />
                        <div className="author-info">
                          <h6 className="color-gray-700">{item.authorname}</h6>
                          <span className="color-gray-700 text-sm">{item.date}</span>
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
          ),
        )}
      </div>
      <div className="text-center mb-50">
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
      <div className="text-center mb-80 mt-50 wow animate__animated animate__pulse">
        <Image width={825} height={160} src="/assets/imgs/page/homepage4/banner-3.png" alt="Genz" />
      </div>
    </>
  );
};

export { EditorPicked };
