import Link from "next/link";

import { ArchiveCard } from "@/components/projects/archive-card";
import { ProjectRow } from "@/components/projects/project-row";
import { SocialLinks } from "@/components/site/social-links";
import { getHomePageData } from "@/lib/content/portfolio-repository";

export default function Home() {
  const data = getHomePageData();
  const hasCaseStudies =
    data.featuredProjects.length + data.supportingProjects.length > 0;

  return (
    <main id="main-content">
      <header className="site-container pb-24 pt-20 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-36">
        <p className="eyebrow">{data.profile.name} · Computer Engineer</p>
        <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-primary sm:text-7xl sm:leading-[1.02] lg:text-[5.5rem]">
          {data.profile.headline}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-secondary sm:text-xl">
          {data.profile.shortIntro}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link className="button-primary" href="#work">
            Explore selected work
          </Link>
          <Link className="button-secondary" href="/about">
            More about me
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="work-title"
        className="border-t border-line"
        id="work"
      >
        <div className="site-container py-20 sm:py-24">
          <div className="section-heading">
            <p className="eyebrow">Selected work</p>
            <h2 id="work-title">Systems built across layers.</h2>
            <p>
              Case studies covering grounded AI systems, developer tooling,
              full-stack products, and physical computing.
            </p>
          </div>

          {hasCaseStudies ? (
            <div className="mt-14 border-b border-line">
              {data.featuredProjects.map((project, index) => (
                <ProjectRow index={index} key={project.slug} project={project} />
              ))}
              {data.supportingProjects.map((project, index) => (
                <ProjectRow
                  compact
                  index={data.featuredProjects.length + index}
                  key={project.slug}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state mt-12">
              No public case studies are available yet. The project archive and
              contact links remain available below.
            </p>
          )}
        </div>
      </section>

      {data.archiveProjects.length > 0 ? (
        <section aria-labelledby="archive-title" className="border-t border-line">
          <div className="site-container py-20 sm:py-24">
            <div className="section-heading">
              <p className="eyebrow">Archive</p>
              <h2 id="archive-title">Earlier builds and experiments.</h2>
              <p>
                Compact records of projects that shaped the engineering work I
                do now.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.archiveProjects.map((project) => (
                <ArchiveCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.aboutPreview.length > 0 ? (
        <section aria-labelledby="about-title" className="border-t border-line">
          <div className="site-container grid gap-12 py-20 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="section-heading">
              <p className="eyebrow">About</p>
              <h2 id="about-title">Engineering is a team discipline.</h2>
              <p>
                The work is technical, but teaching, preparation, and clear
                communication determine whether it becomes useful.
              </p>
              <Link className="text-link mt-7 inline-block" href="/about">
                Read the full story →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.aboutPreview.map((item) => (
                <article
                  className="rounded-2xl border border-line bg-surface p-6"
                  key={item.title}
                >
                  <p className="eyebrow">{item.category}</p>
                  <h3 className="mt-3 text-xl font-semibold text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-secondary">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="contact-title"
        className="border-t border-line"
        id="contact"
      >
        <div className="site-container py-20 sm:py-24">
          <div className="section-heading max-w-3xl">
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title">Let’s build something dependable.</h2>
            <p>
              The most direct way to reach me is email. You can also find my
              public work and professional profile below.
            </p>
          </div>
          <SocialLinks
            className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-lg"
            links={data.socialLinks}
          />
        </div>
      </section>
    </main>
  );
}
