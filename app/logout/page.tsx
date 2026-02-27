"use client";

import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";

export default function Page() {
  useEffect(() => {
    fetch("/api/logout", { method: "POST" })
      .catch(() => null)
      .finally(() => {
        window.location.href = "/";
      });
  }, []);

  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="mt-70">
                <h2 className="color-linear d-inline-block mb-10">Đang đăng xuất…</h2>
                <p className="text-lg color-gray-500">
                  Vui lòng chờ trong giây lát.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
