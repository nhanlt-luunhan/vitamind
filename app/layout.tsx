import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "@/public/assets/css/vendors/boxicons.css";
import "@/public/assets/css/vendors/remixicon.css";
import "@/public/assets/css/style.trim.css";
import "./globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ClerkProvider, RedirectToTasks } from "@clerk/nextjs";
import { getSiteUrl } from "@/lib/utils/site-url";

const siteUrl = getSiteUrl();
const siteName = "VITAMIND";
const siteTitle = "VITAMIND";
const siteDescription =
  "Chia sẻ bài viết, dự án Raspberry Pi, tự động hóa và các sản phẩm công nghệ thực tế.";
const themeInitScript = `
  try {
    var storageKey = "theme";
    var stored = localStorage.getItem(storageKey);
    var mode = stored === "day" || stored === "night" || stored === "system" ? stored : "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = mode === "night" || (mode === "system" && prefersDark);
    document.documentElement.classList.toggle("theme-night", isDark);
    document.documentElement.classList.toggle("theme-day", !isDark);
  } catch (error) {}
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    images: [
      {
        url: "/assets/imgs/template/vitamind-night.svg",
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/assets/imgs/template/vitamind-night.svg"],
  },
  icons: {
    icon: "/assets/imgs/template/favicon.png?v=20260228-2",
    shortcut: "/assets/imgs/template/favicon.png?v=20260228-2",
    apple: "/assets/imgs/template/favicon.png?v=20260228-2",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ClerkProvider
          taskUrls={{
            "reset-password": "/tasks/reset-password",
            "setup-mfa": "/tasks/setup-mfa",
          }}
        >
          <RedirectToTasks />
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
