import { deskSceneGeometry } from "@/lib/desk/scene-geometry";
import type { PersonalMotif, PersonalMotifKey } from "@/types/content";

export const deskHotspotKeys = [
  "maker",
  "quackta",
  "leadership",
  "shared-food",
  "food-favorites",
  "climbing",
  "gym",
  "anime",
] as const;

export type DeskHotspotKey = (typeof deskHotspotKeys)[number];

type DeskHotspotDefinition = Readonly<{
  key: DeskHotspotKey;
  label: string;
  motifKeys: readonly PersonalMotifKey[];
  placement: Readonly<{
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    side: "top" | "right" | "bottom" | "left";
  }>;
}>;

export type DeskHotspotData = DeskHotspotDefinition &
  Readonly<{
    motifs: readonly PersonalMotif[];
  }>;

export const deskHotspotDefinitions = [
  {
    key: "maker",
    label: "Maker origin",
    motifKeys: ["maker-origin"],
    placement: {
      xPercent: 21,
      yPercent: 42,
      widthPercent: 19,
      heightPercent: 17,
      side: "right",
    },
  },
  {
    key: "quackta",
    label: "A debugging duck",
    motifKeys: ["quackta"],
    placement: {
      xPercent: 70,
      yPercent: 36,
      widthPercent: 17,
      heightPercent: 16,
      side: "left",
    },
  },
  {
    key: "leadership",
    label: "Training and leadership",
    motifKeys: ["taekwondo", "scouting"],
    placement: {
      xPercent: 15,
      yPercent: 56,
      widthPercent: 21,
      heightPercent: 17,
      side: "top",
    },
  },
  {
    key: "shared-food",
    label: "Good company",
    motifKeys: ["shared-food"],
    placement: {
      xPercent: 77,
      yPercent: 45,
      widthPercent: 15,
      heightPercent: 22,
      side: "left",
    },
  },
  {
    key: "food-favorites",
    label: "Current food rotation",
    motifKeys: ["food-favorites"],
    placement: {
      xPercent: 57,
      yPercent: 62,
      widthPercent: 26,
      heightPercent: 19,
      side: "top",
    },
  },
  {
    key: "climbing",
    label: "Climbing reset",
    motifKeys: ["climbing"],
    placement: {
      xPercent: 8,
      yPercent: 13,
      widthPercent: 20,
      heightPercent: 12,
      side: "right",
    },
  },
  {
    key: "gym",
    label: "Time under the bar",
    motifKeys: ["gym"],
    placement: {
      xPercent: 70,
      yPercent: 8,
      widthPercent: 20,
      heightPercent: 12,
      side: "top",
    },
  },
  {
    key: "anime",
    label: "Anime nights",
    motifKeys: ["anime"],
    placement: {
      xPercent: 60,
      yPercent: 4,
      widthPercent: 26,
      heightPercent: 25,
      side: "bottom",
    },
  },
] as const satisfies readonly DeskHotspotDefinition[];

/**
 * Placement comes from the generated artwork whenever the scene defines that
 * object, so an overlay can never drift away from the thing it labels. The
 * authored bounds remain only as a fallback, and `side` stays authored because
 * popover direction is an editorial choice, not geometry.
 */
export function resolveHotspotPlacement(
  definition: DeskHotspotDefinition,
): DeskHotspotDefinition["placement"] {
  const generated =
    deskSceneGeometry.hotspots[
      definition.key as keyof typeof deskSceneGeometry.hotspots
    ];

  if (!generated) {
    return definition.placement;
  }

  return {
    xPercent: generated.xPercent,
    yPercent: generated.yPercent,
    widthPercent: generated.widthPercent,
    heightPercent: generated.heightPercent,
    side: definition.placement.side,
  };
}

export function buildDeskHotspots(
  motifs: readonly PersonalMotif[],
  definitions: readonly DeskHotspotDefinition[] = deskHotspotDefinitions,
): readonly DeskHotspotData[] {
  const motifByKey = new Map(motifs.map((motif) => [motif.key, motif]));

  return definitions.map((definition) => ({
    ...definition,
    placement: resolveHotspotPlacement(definition),
    motifs: definition.motifKeys.flatMap((key) => {
      const motif = motifByKey.get(key);
      return motif ? [motif] : [];
    }),
  }));
}

function isOutsideScene(
  placement: DeskHotspotDefinition["placement"],
): boolean {
  const { xPercent, yPercent, widthPercent, heightPercent } = placement;
  return (
    xPercent < 0 ||
    yPercent < 0 ||
    widthPercent <= 0 ||
    heightPercent <= 0 ||
    xPercent + widthPercent > 100 ||
    yPercent + heightPercent > 100
  );
}

export function getDeskHotspotIssues(
  motifs: readonly PersonalMotif[],
  definitions: readonly DeskHotspotDefinition[] = deskHotspotDefinitions,
): readonly string[] {
  const issues: string[] = [];
  const motifKeys = new Set(motifs.map((motif) => motif.key));
  const assignedMotifs = new Set<PersonalMotifKey>();
  const hotspotKeys = new Set<DeskHotspotKey>();

  for (const definition of definitions) {
    if (hotspotKeys.has(definition.key)) {
      issues.push(`deskHotspots: duplicate key ${definition.key}`);
    }
    hotspotKeys.add(definition.key);

    // Both the authored fallback and the placement that actually renders must
    // be inside the scene: checking only the resolved one would let generated
    // geometry silently mask broken authored bounds.
    const placements = [
      definition.placement,
      resolveHotspotPlacement(definition),
    ];

    if (placements.some(isOutsideScene)) {
      issues.push(`deskHotspots.${definition.key}: placement is outside the scene`);
    }

    for (const motifKey of definition.motifKeys) {
      if (!motifKeys.has(motifKey)) {
        issues.push(`deskHotspots.${definition.key}: missing motif ${motifKey}`);
      }
      if (assignedMotifs.has(motifKey)) {
        issues.push(`deskHotspots: motif ${motifKey} is assigned more than once`);
      }
      assignedMotifs.add(motifKey);
    }
  }

  for (const motifKey of motifKeys) {
    if (!assignedMotifs.has(motifKey)) {
      issues.push(`deskHotspots: motif ${motifKey} is not assigned`);
    }
  }

  return issues;
}
