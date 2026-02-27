import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { LoginForm } from "@/components/admin/LoginForm";

export default function Page() {
  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="row mt-70 justify-content-center">
                <div className="col-lg-6">
                  <div className="bg-gray-850 border-gray-800 bdrd16 p-4 p-md-5">
                    <h2 className="color-linear d-inline-block mb-10">Đăng nhập</h2>
                    <p className="text-lg color-gray-500">
                      Chào mừng trở lại. Vui lòng đăng nhập để tiếp tục.
                    </p>
                    <div className="mt-30">
                      <LoginForm />
                    </div>
                    <p className="text-sm color-gray-500 mt-20">
                      Chưa có tài khoản?{" "}
                      <Link className="color-gray-500" href="/register">
                        Đăng ký
                      </Link>
                    </p>
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
