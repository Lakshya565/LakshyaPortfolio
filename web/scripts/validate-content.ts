import { portfolioContent } from "@/content/portfolio";
import {
  assertValidPortfolioContent,
  type ContentValidationMode,
} from "@/lib/content/validate-portfolio-content";

const mode: ContentValidationMode = process.argv.includes("--release")
  ? "release"
  : "development";

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
