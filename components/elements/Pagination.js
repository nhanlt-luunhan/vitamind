import Link from "next/link";

const Pagination = () => {
  return (
    <>
      <nav className="mb-50">
        <ul className="pagination">
          <li className="page-item wow animate__animated animate__fadeIn" data-wow-delay=".0s">
            <Link className="page-link page-prev" href="/blog?page=1">
              <i className="fi-rr-arrow-small-left" />
            </Link>
          </li>
          <li className="page-item wow animate__animated animate__fadeIn" data-wow-delay=".1s">
            <Link className="page-link" href="/blog?page=1">
              1
            </Link>
          </li>
          <li className="page-item wow animate__animated animate__fadeIn" data-wow-delay=".2s">
            <Link className="page-link" href="/blog?page=2">
              2
            </Link>
          </li>
          <li className="page-item wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <Link className="page-link" href="/blog?page=3">
              3
            </Link>
          </li>
          <li className="page-item wow animate__animated animate__fadeIn" data-wow-delay=".4s">
            <Link className="page-link" href="/blog">
              ...
            </Link>
          </li>
          <li className="page-item wow animate__animated animate__fadeIn" data-wow-delay=".5s">
            <Link className="page-link page-next" href="/blog?page=2">
              <i className="fi-rr-arrow-small-right" />
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export { Pagination };
