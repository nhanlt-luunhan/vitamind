import { BackToTop } from "@/components/elements/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { LayoutShell } from "@/components/layout/LayoutShell";

const Layout = ({ children }) => {
  return (
    <>
      <LayoutShell />
      <main className="main">{children}</main>
      <Footer />
      <div className="floating-actions" aria-label="Quick actions">
        <BackToTop />
      </div>
    </>
  );
};

export { Layout };
