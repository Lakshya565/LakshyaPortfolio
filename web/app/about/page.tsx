import type { Metadata } from "next";

import { AboutItemCard } from "@/components/about/about-item-card";
import AboutNarrative from "@/content/about.mdx";
import { SocialLinks } from "@/components/site/social-links";
import { getAboutPageData } from "@/lib/content/portfolio-repository";
import { buildStaticPageMetadata } from "@/lib/metadata/site-metadata";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "About",
  description:
    "About Lakshya Agarwal's engineering interests, education, leadership, and technical skills.",
  path: "/about",
});

export default function AboutPage() {
  const data = getAboutPageData();

  return (
    <main
      className="site-container pb-16 pt-12 sm:pb-20 sm:pt-16"
      id="main-content"
      tabIndex={-1}
    >
      <header className="max-w-4xl border-b border-line pb-10 sm:pb-12">
        <p className="eyebrow">About {data.profile.name}</p>
        <h1 className="page-title mt-4">
          Building across boundaries.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
          {data.profile.shortIntro}
        </p>
        <p className="mt-5 font-mono text-sm text-muted">
          {data.profile.location}
        </p>
      </header>

      <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:gap-16 lg:py-14">
        <article className="prose-content">
          <AboutNarrative />
        </article>

        {data.skillGroups.length > 0 ? (
          <aside aria-labelledby="skills-title" className="rounded-xl border border-line bg-surface p-5">
            <p className="eyebrow">Toolbox</p>
            <h2 className="mt-3 text-2xl font-semibold text-primary" id="skills-title">
              Skills by system layer
            </h2>
            <div className="mt-6 grid gap-5">
              {data.skillGroups.map((group) => (
                <section className="border-t border-line pt-5" key={group.name}>
                  <h3 className="text-sm font-semibold text-primary">
                    {group.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    {group.skills.join(" · ")}
                  </p>
                </section>
              ))}
            </div>
          </aside>
        ) : null}
      </div>

      {data.items.length > 0 ? (
        <section aria-labelledby="perspective-title" className="border-t border-line py-12 sm:py-14">
          <div className="section-heading">
            <p className="eyebrow">Perspective</p>
            <h2 id="perspective-title">What shapes the work.</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.items.map((item) => (
              <AboutItemCard item={item} key={item.title} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="about-contact-title" className="border-t border-line pt-12 sm:pt-14">
        <div className="section-heading">
          <p className="eyebrow">Connect</p>
          <h2 id="about-contact-title">Continue the conversation.</h2>
        </div>
        <SocialLinks
          className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-lg"
          links={data.socialLinks}
        />
      </section>
    </main>
  );
}
