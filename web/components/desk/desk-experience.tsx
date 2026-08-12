"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { DeskHotspotData, DeskHotspotKey } from "@/lib/desk/hotspots";

type HotspotStyle = CSSProperties &
  Readonly<{
    "--hotspot-x": `${number}%`;
    "--hotspot-y": `${number}%`;
    "--hotspot-width": `${number}%`;
    "--hotspot-height": `${number}%`;
  }>;

const subscribeToHydration = () => () => undefined;

function toHotspotStyle(hotspot: DeskHotspotData): HotspotStyle {
  return {
    "--hotspot-x": `${hotspot.placement.xPercent}%`,
    "--hotspot-y": `${hotspot.placement.yPercent}%`,
    "--hotspot-width": `${hotspot.placement.widthPercent}%`,
    "--hotspot-height": `${hotspot.placement.heightPercent}%`,
  };
}

function DeskHotspot({
  hotspot,
  isOpen,
  onOpenChange,
}: Readonly<{
  hotspot: DeskHotspotData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const titleId = useId();
  const descriptionId = useId();
  const closeTimerRef = useRef<number | null>(null);
  const suppressFocusOpenRef = useRef(false);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onOpenChange(false);
    }, 120);
  };

  return (
    <li className="desk-hotspot" style={toHotspotStyle(hotspot)}>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            aria-label={`Explore ${hotspot.label}`}
            className="desk-hotspot-trigger"
            onClick={(event) => {
              if (isOpen) {
                event.preventDefault();
              }
            }}
            onFocus={() => {
              if (suppressFocusOpenRef.current) {
                suppressFocusOpenRef.current = false;
                return;
              }
              onOpenChange(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onOpenChange(false);
              }
            }}
            onMouseEnter={() => {
              cancelScheduledClose();
              onOpenChange(true);
            }}
            onMouseLeave={scheduleClose}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={scheduleClose}
          onEscapeKeyDown={() => {
            suppressFocusOpenRef.current = true;
            onOpenChange(false);
          }}
          side={hotspot.placement.side}
          sideOffset={10}
        >
          <PopoverHeader>
            <PopoverTitle id={titleId}>{hotspot.label}</PopoverTitle>
            <PopoverDescription id={descriptionId}>
              {hotspot.details.map((detail) => (
                <span className="desk-popover-fact" key={detail}>
                  {detail}
                </span>
              ))}
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </li>
  );
}

export function DeskExperience({
  hotspots,
  scene,
}: Readonly<{
  hotspots: readonly DeskHotspotData[];
  /** The inlined SVG, rendered on the server so its markup never ships as JS. */
  scene: ReactNode;
}>) {
  const [activeHotspot, setActiveHotspot] = useState<DeskHotspotKey | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  /**
   * Lift the hovered object itself, the way guochen.design does — the artwork
   * responds, not just a panel beside it. The overlay buttons stay because they
   * are what make the scene keyboard-reachable and screen-reader legible; Guo's
   * version is mouse-only, and that is the one place not to copy him.
   */
  useEffect(() => {
    const root = sceneRef.current;
    if (!root) {
      return;
    }

    for (const node of root.querySelectorAll("[data-object][data-lifted]")) {
      node.removeAttribute("data-lifted");
    }

    if (activeHotspot) {
      root
        .querySelector(`[data-object="${activeHotspot}"]`)
        ?.setAttribute("data-lifted", "");
    }
  }, [activeHotspot]);

  return (
    <div className="desk-experience">
      <div className="desk-scene-frame" ref={sceneRef}>
        {scene}

        {hydrated ? (
          <ul aria-label="Things on my desk" className="desk-hotspots">
            {hotspots.map((hotspot) => (
              <DeskHotspot
                hotspot={hotspot}
                isOpen={activeHotspot === hotspot.key}
                key={hotspot.key}
                onOpenChange={(open) =>
                  setActiveHotspot(open ? hotspot.key : null)
                }
              />
            ))}
          </ul>
        ) : null}
      </div>

      {hydrated ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="desk-drawer-trigger" variant="outline">
              Things on my desk
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Things on my desk</DrawerTitle>
              <DrawerDescription>
                A few things that explain how I work and reset.
              </DrawerDescription>
            </DrawerHeader>
            <div className="desk-drawer-list">
              {hotspots.map((hotspot) => (
                <details key={hotspot.key}>
                  <summary>{hotspot.label}</summary>
                  {hotspot.details.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </details>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  );
}
