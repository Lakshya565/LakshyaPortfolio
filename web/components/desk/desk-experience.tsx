"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          sideOffset={8}
        >
          <PopoverHeader>
            <PopoverTitle id={titleId}>{hotspot.label}</PopoverTitle>
            <PopoverDescription id={descriptionId}>
              {hotspot.motifs.map((motif) => (
                <span className="desk-popover-fact" key={motif.key}>
                  {motif.detail}
                </span>
              ))}
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </li>
  );
}

function hasModifiedNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function DeskExperience({
  hotspots,
  projectTree,
}: Readonly<{
  hotspots: readonly DeskHotspotData[];
  projectTree: ReactNode;
}>) {
  const [activeHotspot, setActiveHotspot] = useState<DeskHotspotKey | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const monitorRef = useRef<HTMLAnchorElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);
  const drawerTitleRef = useRef<HTMLHeadingElement>(null);
  const openTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const syncDialogToHistory = () => {
      const shouldOpen = window.location.hash === "#project-system";
      setDialogOpen(shouldOpen);
      if (!shouldOpen) {
        setZoomed(false);
      }
    };

    const initialSyncTimer = window.setTimeout(syncDialogToHistory, 0);
    window.addEventListener("hashchange", syncDialogToHistory);
    window.addEventListener("popstate", syncDialogToHistory);
    return () => {
      window.clearTimeout(initialSyncTimer);
      window.removeEventListener("hashchange", syncDialogToHistory);
      window.removeEventListener("popstate", syncDialogToHistory);
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!zoomed || dialogOpen) {
      return;
    }

    const cancelPendingOpen = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      setZoomed(false);
      monitorRef.current?.focus();
    };

    window.addEventListener("keydown", cancelPendingOpen, true);
    return () => window.removeEventListener("keydown", cancelPendingOpen, true);
  }, [dialogOpen, zoomed]);

  const openProjectTree = () => {
    const destination = new URL(window.location.href);
    destination.hash = "project-system";
    if (window.location.hash !== destination.hash) {
      window.history.pushState({ projectSystem: true }, "", destination);
    }
    setDialogOpen(true);
  };

  const handleMonitorClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (hasModifiedNavigation(event)) {
      return;
    }

    event.preventDefault();
    setActiveHotspot(null);
    const shouldOpenImmediately =
      event.detail === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldOpenImmediately) {
      openProjectTree();
      return;
    }

    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
    }
    setZoomed(true);
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      openProjectTree();
    }, 600);
  };

  const requestDialogClose = () => {
    if (window.location.hash === "#project-system") {
      window.history.back();
      return;
    }
    setDialogOpen(false);
    setZoomed(false);
  };

  return (
    <>
      <div className="desk-experience">
        <div className="desk-scene-frame">
          <div className="desk-camera" data-zoomed={zoomed || undefined}>
            {/* A raw SVG avoids rasterizing or proxying this lightweight local illustration. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              aria-hidden="true"
              className="desk-art"
              fetchPriority="high"
              height="900"
              src="/media/site/lakshya-desk.svg"
              width="1440"
            />

            {hydrated ? (
              <ul aria-label="Objects on my desk" className="desk-hotspots">
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

            <Link
              aria-label="Explore the project tree"
              className="desk-monitor-trigger"
              href="/work"
              onClick={handleMonitorClick}
              ref={monitorRef}
            >
              <span>Explore project tree</span>
            </Link>
          </div>
        </div>

        {hydrated ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="desk-drawer-trigger" variant="outline">
                Objects on my desk
              </Button>
            </DrawerTrigger>
            <DrawerContent
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                drawerTitleRef.current?.focus();
              }}
            >
              <DrawerHeader>
                <DrawerTitle ref={drawerTitleRef} tabIndex={-1}>
                  Objects on my desk
                </DrawerTitle>
                <DrawerDescription>
                  A few things that explain how I work and reset.
                </DrawerDescription>
              </DrawerHeader>
              <div className="desk-drawer-list">
                {hotspots.map((hotspot) => (
                  <details key={hotspot.key}>
                    <summary>{hotspot.label}</summary>
                    {hotspot.motifs.map((motif) => (
                      <p key={motif.key}>{motif.detail}</p>
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

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && requestDialogClose()}>
        <DialogContent
          aria-describedby="project-system-dialog-description"
          className="project-system-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            monitorRef.current?.focus();
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            dialogTitleRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle ref={dialogTitleRef} tabIndex={-1}>
              Project tree
            </DialogTitle>
            <DialogDescription id="project-system-dialog-description">
              Open a node for context, or follow it to the complete project story.
            </DialogDescription>
          </DialogHeader>
          <div className="project-system-dialog-scroll">{projectTree}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
