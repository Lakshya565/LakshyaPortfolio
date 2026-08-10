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
          The project may be unpublished, may not have a case study, or the URL
          may be incorrect.
        </p>
        <Link
          className="button-primary mt-8 inline-flex"
          href="/"
        >
          Return to the portfolio
        </Link>
      </section>
    </main>
  );
}
