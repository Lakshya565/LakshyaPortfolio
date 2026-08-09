import type { Metadata } from "next";

import AboutNarrative from "@/content/about.mdx";
import { SocialLinks } from "@/components/site/social-links";
import { getAboutPageData } from "@/lib/content/portfolio-repository";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Lakshya Agarwal's engineering interests, education, leadership, and technical skills.",
};

export default function AboutPage() {
  const data = getAboutPageData();

  return (
    <main className="site-container pb-24 pt-16 sm:pb-32 sm:pt-24" id="main-content">
      <header className="max-w-4xl border-b border-line pb-14 sm:pb-20">
        <p className="eyebrow">About {data.profile.name}</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-primary sm:text-7xl">
          Building across boundaries.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-secondary sm:text-xl">
          {data.profile.shortIntro}
        </p>
        <p className="mt-5 font-mono text-sm text-muted">
          {data.profile.location}
        </p>
      </header>

      <div className="grid gap-16 py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:gap-24 lg:py-20">
        <article className="prose-content">
          <AboutNarrative />
        </article>

        {data.skillGroups.length > 0 ? (
          <aside aria-labelledby="skills-title">
            <p className="eyebrow">Toolbox</p>
            <h2 className="mt-3 text-2xl font-semibold text-primary" id="skills-title">
              Skills by system layer
            </h2>
            <div className="mt-7 grid gap-6">
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
        <section aria-labelledby="perspective-title" className="border-t border-line py-16 sm:py-20">
          <div className="section-heading">
            <p className="eyebrow">Perspective</p>
            <h2 id="perspective-title">What shapes the work.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {data.items.map((item) => (
              <article className="rounded-2xl border border-line bg-surface p-6" key={item.title}>
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
        </section>
      ) : null}

      <section aria-labelledby="about-contact-title" className="border-t border-line pt-16 sm:pt-20">
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
