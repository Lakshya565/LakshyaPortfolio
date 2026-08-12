import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="site-container flex min-h-[62vh] items-center py-14"
      id="main-content"
      tabIndex={-1}
    >
      <section aria-labelledby="not-found-title">
        <p className="eyebrow">
          Signal not found · 404
        </p>
        <h1
          className="page-title mt-4 max-w-3xl"
          id="not-found-title"
        >
          This route is not connected.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-secondary">
          This page does not exist, or the URL may be incorrect. Every published
          project has a permanent home in the project tree.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3" role="list">
          <li>
            <Link className="button-primary inline-flex" href="/#project-tree">
              Browse the project tree
            </Link>
          </li>
          <li>
            <Link className="button-secondary inline-flex" href="/about">
              About me
            </Link>
          </li>
          <li>
            <Link className="button-secondary inline-flex" href="/">
              Return home
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
