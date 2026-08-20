import type { Metadata } from "next";

import { AboutRail } from "@/components/about/about-rail";
import { AboutRailBeams } from "@/components/about/about-rail-beams";
import { SocialLinks } from "@/components/site/social-links";
import { getAboutPageData } from "@/lib/content/portfolio-repository";
import { buildStaticPageMetadata } from "@/lib/metadata/site-metadata";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "About",
  description:
    "Who Lakshya Agarwal is: what he is studying and building now, what he does away from the workbench, and how he approaches engineering.",
  path: "/about",
});

/**
 * The label above each rail, and the order they run in.
 *
 * `now` before `work`: a visitor who followed "Who am I?" from the project tree
 * came for the person, and the engineering answers the question they asked
 * second.
 */
const railLabels = {
  now: "Where I am right now",
  work: "How I work",
} as const;

export default function AboutPage() {
  const data = getAboutPageData();

  return (
    <main
      className="site-container about-page"
      id="main-content"
      tabIndex={-1}
    >
      {/* The whole figure is one stage: the beam layer is `inset: 0` on this
          element and measures the intro and both rails inside it. */}
      <div className="about-stage">
        <header className="about-intro">
          <p className="eyebrow">About</p>
          {/* The same words as the root card that leads here, so the click and
              the landing agree. */}
          <h1 className="page-title">Who am I?</h1>

          <p className="about-name-line">
            My name is {data.intro.name}
            <span className="about-name-aside">
              {" "}
              (pronounced {data.intro.pronunciation})
            </span>
            , I go by {data.intro.nickname}, and it means {data.intro.meaning}.
          </p>

          <p className="about-intro-body">{data.intro.body}</p>
        </header>

        {data.rails.map((rail) => (
          <AboutRail
            headingId={`about-rail-${rail.key}`}
            key={rail.key}
            label={railLabels[rail.key]}
            panels={rail.panels}
            railKey={rail.key}
          />
        ))}

        {/* Last, so it paints over the connector hairlines. It draws nothing
            until it has measured, and nothing at all on a stacked layout or
            with reduced motion — the CSS rails are complete without it. */}
        <AboutRailBeams />
      </div>

      <section
        aria-labelledby="about-contact-title"
        className="about-connect"
      >
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
