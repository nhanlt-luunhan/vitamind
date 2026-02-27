import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { RegisterForm } from "@/components/admin/RegisterForm";

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
                    <h2 className="color-linear d-inline-block mb-10">Tạo tài khoản</h2>
                    <p className="text-lg color-gray-500">
                      Điền thông tin cơ bản để bắt đầu quản lý nội dung.
                    </p>
                    <div className="mt-30">
                      <RegisterForm />
                    </div>
                    <p className="text-sm color-gray-500 mt-20">
                      Đã có tài khoản?{" "}
                      <Link className="color-gray-500" href="/login">
                        Đăng nhập
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
