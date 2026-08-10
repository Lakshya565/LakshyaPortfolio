import Link from "next/link";

import { CircuitScene } from "@/components/project-map/circuit-scene";
import { ArchiveCard } from "@/components/projects/archive-card";
import { ProjectBentoGrid } from "@/components/projects/project-bento-grid";
import { SocialLinks } from "@/components/site/social-links";
import { Button } from "@/components/ui/button";
import { getHomePageData } from "@/lib/content/portfolio-repository";

export default function Home() {
  const data = getHomePageData();
  const caseStudies = [
    ...data.featuredProjects,
    ...data.supportingProjects,
  ];

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="personal-hero site-container">
        <div className="personal-hero-copy">
          <p className="eyebrow">{data.profile.name} · Computer Engineering</p>
          <h1 className="hero-title">{data.profile.headline}</h1>
          <p className="hero-intro">{data.profile.shortIntro}</p>
          <SocialLinks
            className="hero-social-links"
            links={data.socialLinks}
          />
        </div>

        {data.projectMap.length > 0 ? (
          <CircuitScene
            identity={{ name: data.profile.name }}
            personalMotifs={data.personalMotifs}
            projects={data.projectMap}
          />
        ) : null}
      </header>

      <section
        aria-labelledby="work-title"
        className="border-t border-line"
        id="work"
      >
        <div className="section-shell site-container">
          <h2 className="home-section-title" id="work-title">
            Case studies
          </h2>
          {caseStudies.length > 0 ? (
            <ProjectBentoGrid
              featuredProjects={data.featuredProjects}
              supportingProjects={data.supportingProjects}
            />
          ) : (
            <p className="empty-state">No public case studies are available yet.</p>
          )}
        </div>
      </section>

      {data.archiveProjects.length > 0 ? (
        <section aria-labelledby="archive-title" className="border-t border-line">
          <div className="section-shell section-shell-compact site-container">
            <h2 className="home-section-title" id="archive-title">
              Archive
            </h2>
            <div className="archive-grid">
              {data.archiveProjects.map((project) => (
                <ArchiveCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="about-title"
        className="border-t border-line"
        id="contact"
      >
        <div className="personal-closing site-container">
          <div>
            <p className="eyebrow">Away from the workbench</p>
            <h2 id="about-title">I like learning with other people.</h2>
          </div>
          <div>
            <p>
              Teaching has shaped how I engineer. So have bouldering, lifting,
              anime nights, and finding good food—from boba and froyo to sushi,
              Thai food, and Indian food—with people I care about.
            </p>
            <Button asChild className="mt-4" variant="link">
              <Link href="/about">A little more about me →</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
