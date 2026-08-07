import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

function Callout({ children }: Readonly<{ children: ReactNode }>) {
  return <aside>{children}</aside>;
}

function Figure({
  children,
  caption,
}: Readonly<{ children: ReactNode; caption?: string }>) {
  return (
    <figure>
      {children}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Comparison({ children }: Readonly<{ children: ReactNode }>) {
  return <section aria-label="Comparison">{children}</section>;
}

const components = {
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const isExternal = props.href?.startsWith("https://") ?? false;

    return (
      <a
        {...props}
        rel={isExternal ? "noreferrer noopener" : props.rel}
        target={isExternal ? "_blank" : props.target}
      />
    );
  },
  Callout,
  Figure,
  Comparison,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}

