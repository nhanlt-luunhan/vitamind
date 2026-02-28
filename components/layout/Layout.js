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
      <div className="floating-actions" aria-label="Quick actions">
        <ZaloChatWidget />
        <BackToTop />
      </div>
    </>
  );
};

export { Layout };
