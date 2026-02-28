import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui";

export default function Page404() {
  return (
    <Layout>
      <div className="cover-home3 shadow-page-404">
        <div className="container">
          <div className="row">
            <div className="col-xl-10 col-lg-12 ml-auto mr-auto">
              <div className="box-page-404">
                <div className="text-center mb-150 mt-100">
                  <div className="box-404 row">
                    <div className="col-lg-6">
                      <div className="image-404">
                        <Image
                          width={384}
                          height={360}
                          src="/assets/imgs/page/404/404.svg"
                          alt="Vitamind"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="info-404 text-start mt-60">
                        <h2 className="color-linear mb-20">Không tìm thấy trang</h2>
                        <p className="text-xl color-gray-500">
                          Trang bạn tìm không tồn tại hoặc đã được di chuyển. Vui lòng quay về trang
                          chủ.
                        </p>
                        <div className="mt-25">
                          <Button asChild unstyled className="btn btn-linear hover-up">
                            <Link href="/">Trang chủ</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
