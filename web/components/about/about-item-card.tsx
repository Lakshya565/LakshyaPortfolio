import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AboutItem } from "@/types/content";

export function AboutItemCard({ item }: Readonly<{ item: AboutItem }>) {
  return (
    <Card asChild className="about-item-card h-full" size="sm">
      <article>
        <CardHeader className="gap-3">
          <p className="eyebrow">{item.category}</p>
          <CardTitle>
            <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
          </CardTitle>
          <CardDescription>{item.body}</CardDescription>
        </CardHeader>
      </article>
    </Card>
  );
}
