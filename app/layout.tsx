import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "@/public/assets/css/style.trim.css";
import "./globals.css";

import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const beVietnam = localFont({
  variable: "--font-sans",
  src: [
    {
      path: "../public/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata = {
  title: "Vitamind - Blog cá nhân",
  description: "Mẫu blog cá nhân sáng tạo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={beVietnam.variable}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
