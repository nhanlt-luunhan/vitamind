import Link from "next/link";
import Image from "next/image";
import data from "@/content/blogData2";
import { Button } from "@/components/ui";

const EditorPicked3 = () => {
  return (
    <>
      <div className="row mt-70">
        <h2 className="color-linear d-inline-block mb-10 wow animate__animated animate__fadeInUp">
          Bài viết nổi bật
        </h2>
        <p className="text-lg color-gray-500 wow animate__animated animate__fadeInUp">
          Khám phá những bài viết nổi bật ở mọi chủ đề
        </p>
        <div className="row mt-70">
          {data.slice(0, 6).map((item, i) => (
            <div className="col-lg-4" key={i}>
              <div
                className="card-style-1 hover-up mb-30 wow animate__animated animate__fadeIn"
                data-wow-delay=".0s"
              >
                <div className="card-image">
                  <Link className="link-post" href={`/blog/${item.id}`}>
                    <Image
                      width={223}
                      height={392}
                      src={`/assets/imgs/page/homepage3/${item.img}`}
                      alt="Genz"
                    />
                    <div className="card-info card-bg-2">
                      <div className="info-bottom mb-15">
                        <h4 className="color-white mb-15">{item.title}</h4>
                        <div className="box-author">
                          <Image
                            width={34}
                            height={34}
                            src="/assets/imgs/page/homepage3/author.jpg"
                            alt="Genz"
                          />
                          <div className="author-info">
                            <h6 className="mr-15 color-gray-700">{item.authorName}</h6>
                            <span className="color-gray-700 text-sm">{item.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
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

export { EditorPicked3 };
