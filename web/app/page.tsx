import {
  getContentFoundationSummary,
  getSiteProfile,
} from "@/lib/content/get-site-profile";

export default function Home() {
  const profile = getSiteProfile();
  const contentSummary = getContentFoundationSummary();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10 lg:px-16">
      <section aria-labelledby="page-title" className="max-w-3xl">
        <p className="mb-5 font-mono text-sm uppercase tracking-[0.24em] text-emerald-300">
          Portfolio foundation · Phase 0
        </p>
        <h1
          id="page-title"
          className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl"
        >
          {profile.name}
        </h1>
        <p className="mt-7 text-xl leading-8 text-slate-200 sm:text-2xl sm:leading-9">
          {profile.headline}
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
          {profile.shortIntro}
        </p>
        <div className="mt-10 border-l border-emerald-400/40 pl-5 text-sm leading-6 text-slate-400">
          Content foundation: {contentSummary.projectCount} planned projects, {" "}
          {contentSummary.caseStudyCount} case-study drafts, and {" "}
          {contentSummary.archiveCount} substantial archive cards. Routes and the
          atmospheric circuit interface remain in later approved phases.
        </div>
      </section>
    </main>
  );
}
