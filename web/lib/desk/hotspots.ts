import { deskSceneGeometry } from "@/lib/desk/scene-geometry";
import type { PersonalMotif, PersonalMotifKey } from "@/types/content";

export const deskHotspotKeys = [
  "colophon",
  "maker",
  "quackta",
  "taekwondo",
  "scouting",
  "shared-food",
  "food-favorites",
  "climbing",
  "gym",
  "anime",
  "kirby",
  "triforce",
  "music",
] as const;

export type DeskHotspotKey = (typeof deskHotspotKeys)[number];

type DeskHotspotDefinition = Readonly<{
  key: DeskHotspotKey;
  label: string;
  motifKeys: readonly PersonalMotifKey[];
  /**
   * Copy for a hotspot that is not about a personal motif.
   *
   * Only the colophon uses this. Rather than invent a fake motif to satisfy the
   * motif contract — which would put site-build trivia into the personal content
   * model where it does not belong — a hotspot may carry its own text and no
   * motif keys at all.
   */
  facts?: readonly string[];
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
    /** Motif details and authored facts, flattened for rendering. */
    details: readonly string[];
  }>;

export const deskHotspotDefinitions = [
  {
    key: "colophon",
    label: "How This Site Was Built",
    motifKeys: [],
    facts: [
      "Next.js and React with TypeScript throughout, styled with Tailwind, and deployed as a static build.",
      "The desk is generated, and all assets are hand-drawn: every object is typed scene data projected through one camera, so the artwork cannot drift out of step with the code.",
      "Built with assistance from Claude, and the isometric field owes its whole approach to Guo Chen's work at guochen.design.",
    ],
    placement: {
      xPercent: 40,
      yPercent: 4,
      widthPercent: 22,
      heightPercent: 24,
      side: "right",
    },
  },
  {
    key: "maker",
    label: "Humble Beginnings",
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
    label: "A Debugging Duck",
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
    key: "taekwondo",
    label: "Master Instructor & Fourth-Degree Black Belt",
    motifKeys: ["taekwondo"],
    placement: {
      xPercent: 12,
      yPercent: 56,
      widthPercent: 13,
      heightPercent: 15,
      side: "top",
    },
  },
  {
    key: "scouting",
    label: "Eagle Scout",
    motifKeys: ["scouting"],
    placement: {
      xPercent: 26,
      yPercent: 62,
      widthPercent: 12,
      heightPercent: 13,
      side: "top",
    },
  },
  {
    key: "shared-food",
    label: "Food & Friends",
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
    label: "Current Favorites",
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
    label: "Moonlighting As A Monkey",
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
    label: "Lifting Heavy Circles",
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
    label: "Anime Enthusiast",
    motifKeys: ["anime"],
    placement: {
      xPercent: 60,
      yPercent: 4,
      widthPercent: 26,
      heightPercent: 25,
      side: "bottom",
    },
  },
  {
    key: "kirby",
    label: "Smash Main",
    motifKeys: ["kirby"],
    placement: {
      xPercent: 34,
      yPercent: 70,
      widthPercent: 12,
      heightPercent: 16,
      side: "top",
    },
  },
  {
    key: "triforce",
    label: "Favourite Series",
    motifKeys: ["triforce"],
    placement: {
      xPercent: 46,
      yPercent: 72,
      widthPercent: 12,
      heightPercent: 14,
      side: "top",
    },
  },
  {
    key: "music",
    label: "Always Something Playing",
    motifKeys: ["music"],
    placement: {
      xPercent: 44,
      yPercent: 54,
      widthPercent: 16,
      heightPercent: 14,
      side: "right",
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

  return definitions.map((definition) => {
    const motifs = definition.motifKeys.flatMap((key) => {
      const motif = motifByKey.get(key);
      return motif ? [motif] : [];
    });

    return {
      ...definition,
      placement: resolveHotspotPlacement(definition),
      motifs,
      details: [
        ...motifs.map((motif) => motif.detail),
        ...(definition.facts ?? []),
      ],
    };
  });
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

    // A hotspot with neither motifs nor authored facts opens an empty popup.
    // Allowing `motifKeys: []` for the colophon means this has to be checked
    // explicitly rather than falling out of the motif contract.
    if (definition.motifKeys.length === 0 && (definition.facts ?? []).length === 0) {
      issues.push(`deskHotspots.${definition.key}: has no motifs and no facts`);
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
