import Link from "next/link";

import { IsometricDesk } from "@/components/desk/isometric-desk";
import { SocialLinks } from "@/components/site/social-links";
import { Button } from "@/components/ui/button";
import { getHomePageData } from "@/lib/content/portfolio-repository";

export default function Home() {
  const data = getHomePageData();

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

        <IsometricDesk data={data} />
      </header>

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
            <Button
              asChild
              className="mt-4 whitespace-normal text-left"
              variant="link"
            >
              <Link href="/about">A little more about me →</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
