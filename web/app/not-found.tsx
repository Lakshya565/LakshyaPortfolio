import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-container flex min-h-[70vh] items-center py-20" id="main-content">
      <section aria-labelledby="not-found-title">
        <p className="eyebrow">
          Signal not found · 404
        </p>
        <h1
          className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-6xl"
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
