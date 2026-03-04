import { BackToTop } from "@/components/elements/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ZaloChatWidget } from "@/components/widgets/ZaloChatWidget";

const Layout = ({ children }) => {
  return (
    <>
      <LayoutShell />
      <main className="main">{children}</main>
      <Footer />
      <ZaloChatWidget />
      <div className="floating-actions" aria-label="Quick actions">
        <BackToTop />
      </div>
    </>
  );
};

export { Layout };
