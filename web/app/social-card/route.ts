import { createPortfolioSocialImage } from "@/lib/metadata/social-image";
import { socialImageSize } from "@/lib/metadata/social-image-config";

export const dynamic = "force-static";

export function GET() {
  return createPortfolioSocialImage(socialImageSize);
}
