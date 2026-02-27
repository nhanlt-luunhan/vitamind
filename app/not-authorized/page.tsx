import { Layout } from "@/components/layout/Layout";

export default function Page() {
  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="mt-70">
                <h2 className="color-linear d-inline-block mb-10">Không có quyền truy cập</h2>
                <p className="text-lg color-gray-500">
                  Tài khoản của bạn chưa đủ quyền hoặc đang bị khóa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
