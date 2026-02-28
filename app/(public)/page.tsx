import { Layout } from "@/components/layout/Layout";
import { Hero1 } from "@/components/sections/Hero1";
import { EditorPicked } from "@/components/sections/EditorPicked";
import { PopularCategories } from "@/components/sections/PopularCategories";
import { RecentPosts } from "@/components/sections/RecentPosts";
import { Sidebar } from "@/components/layout/Sidebar";
import { HotTopic } from "@/components/slider/HotTopic";

export default function Home() {
  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="home-stage">
              <Hero1 />
              <HotTopic />
              <EditorPicked />
              <PopularCategories />
              <div className="row home-stage__content">
                <div className="col-lg-8">
                  <RecentPosts />
                </div>
                <div className="col-lg-4">
                  <Sidebar />
                </div>
              </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
