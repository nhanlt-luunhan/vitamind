import { CursorDot } from "@/components/elements/CursorDot";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CursorDot />
    </>
  );
}
