import Link from "next/link";

type Props = {
  title: string;
  subName: string;
};

export function UserListPageTitle({ title, subName }: Props) {
  return (
    <div className="page-title-box">
      <h4 className="mb-0 fw-semibold">{title}</h4>
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link href="/admin/database">{subName}</Link>
        </li>
        <li className="breadcrumb-item active">{title}</li>
      </ol>
    </div>
  );
}
