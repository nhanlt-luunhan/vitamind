import { SignIn } from "@clerk/nextjs";
import { Layout } from "@/components/layout/Layout";

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
                    <SignIn signUpUrl="/sign-up" afterSignInUrl="/account" />
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
