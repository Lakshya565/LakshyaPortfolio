"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function parseCssDuration(value: string, fallback: number) {
  const normalized = value.trim().toLowerCase();
  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount)) {
    return fallback;
  }

  return normalized.endsWith("ms")
    ? amount
    : normalized.endsWith("s")
      ? amount * 1000
      : amount;
}

function focusRouteDestination(main: HTMLElement) {
  const rawHash = window.location.hash.slice(1);
  let hash = rawHash;

  try {
    hash = decodeURIComponent(rawHash);
  } catch {
    // A malformed fragment should not prevent route focus from recovering.
  }
  const destination =
    (hash ? document.getElementById(hash) : null) ??
    main.querySelector<HTMLElement>("h1");

  if (!destination) {
    return;
  }

  const addedTabIndex = !destination.hasAttribute("tabindex");
  if (addedTabIndex) {
    destination.setAttribute("tabindex", "-1");
    destination.addEventListener(
      "blur",
      () => destination.removeAttribute("tabindex"),
      { once: true },
    );
  }

  destination.focus({ preventScroll: !hash });
}

export function RouteTransitionController() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const activeAnimation = useRef<Animation | null>(null);
  const lastNavigationWasPointer = useRef(true);

  useEffect(() => {
    const markPointerNavigation = () => {
      lastNavigationWasPointer.current = true;
    };
    const markKeyboardNavigation = () => {
      lastNavigationWasPointer.current = false;
    };

    window.addEventListener("pointerdown", markPointerNavigation, true);
    window.addEventListener("keydown", markKeyboardNavigation, true);

    return () => {
      window.removeEventListener("pointerdown", markPointerNavigation, true);
      window.removeEventListener("keydown", markKeyboardNavigation, true);
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    const main = document.querySelector<HTMLElement>("main");

    if (!main) {
      return;
    }

    activeAnimation.current?.cancel();

    if (
      lastNavigationWasPointer.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      typeof main.animate === "function"
    ) {
      const rootStyles = getComputedStyle(document.documentElement);
      const duration = parseCssDuration(
        rootStyles.getPropertyValue("--duration-route"),
        160,
      );
      const easing =
        rootStyles.getPropertyValue("--ease-out").trim() ||
        "cubic-bezier(0.23, 1, 0.32, 1)";

      const animation = main.animate(
        [
          { opacity: 0.9, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration, easing },
      );
      activeAnimation.current = animation;
      animation.addEventListener(
        "finish",
        () => {
          if (activeAnimation.current === animation) {
            activeAnimation.current = null;
          }
        },
        { once: true },
      );
    }

    const focusFrame = window.requestAnimationFrame(() =>
      focusRouteDestination(main),
    );

    return () => {
      window.cancelAnimationFrame(focusFrame);
      activeAnimation.current?.cancel();
    };
  }, [pathname]);

  return null;
}
