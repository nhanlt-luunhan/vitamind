"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Layout } from "@/components/layout/Layout";

export default function Page() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    const run = async () => {
      await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);

      if (!isLoaded) return;
      if (isSignedIn) {
        signOut(() => router.replace("/"));
        return;
      }
      router.replace("/");
    };

    run();
  }, [isLoaded, isSignedIn, signOut, router]);

  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="mt-70">
                <h2 className="color-linear d-inline-block mb-10">Đang đăng xuất…</h2>
                <p className="text-lg color-gray-500">Vui lòng chờ trong giây lát.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
