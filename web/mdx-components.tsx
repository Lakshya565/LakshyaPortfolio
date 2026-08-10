import type { MDXComponents } from "mdx/types";
import { Children, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { isSafeEditorialHref } from "@/lib/content/editorial-links";
import { createHeadingAnchor } from "@/lib/content/heading-anchors";

function Callout({ children }: Readonly<{ children: ReactNode }>) {
  return <aside className="case-study-callout">{children}</aside>;
}

function getHeadingText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number" ? String(child) : "",
    )
    .join("")
    .trim();
}

function Heading({
  as: Element,
  children,
  ...props
}: Readonly<
  ComponentPropsWithoutRef<"h2"> & {
    as: "h2" | "h3";
  }
>) {
  return (
    <Element {...props} id={createHeadingAnchor(getHeadingText(children))}>
      {children}
    </Element>
  );
}

const components = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading {...props} as="h2" />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <Heading {...props} as="h3" />,
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const href = props.href;

    if (!href || !isSafeEditorialHref(href)) {
      return <span>{props.children}</span>;
    }

    const isExternal = href.startsWith("https://");

    return (
      <a
        {...props}
        href={href}
        rel={isExternal ? "noreferrer noopener" : props.rel}
        target={isExternal ? "_blank" : props.target}
      >
        {props.children}
        {isExternal ? (
          <span className="sr-only"> (opens in a new tab)</span>
        ) : null}
      </a>
    );
  },
  Callout,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
