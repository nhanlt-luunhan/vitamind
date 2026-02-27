import Link from "next/link";

function Breadcrumb({ title }) {
  return (
    <ul className="breadcrumb">
      <li>
        <Link className="home" href="/">
          Trang chủ
        </Link>
      </li>
      <li>
        <Link href="/blog">Bài viết</Link>
      </li>
      <li>
        <span>{title}</span>
      </li>
    </ul>
  );
}
export { Breadcrumb };
