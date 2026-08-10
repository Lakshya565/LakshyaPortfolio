import { portfolioContent } from "@/content/portfolio";
import {
  assertValidPortfolioContent,
  resolveContentValidationMode,
} from "@/lib/content/validate-portfolio-content";

const mode = resolveContentValidationMode({
  commandLineArguments: process.argv,
  siteOrigin: process.env.NEXT_PUBLIC_SITE_URL,
});

async function main() {
  try {
    await assertValidPortfolioContent(portfolioContent, {
      mode,
      webRoot: process.cwd(),
    });
    console.log(`Portfolio content validation passed in ${mode} mode.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void main();
