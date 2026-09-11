"use client"

/* Magic UI, `npx shadcn add @magicui/backlight`. Unmodified except for the
   directive above: `useId` is a hook, so this cannot run in a Server
   Component, and one of its two call sites is one. */

import { useId, type ReactElement } from "react"

type BacklightProps = {
  children?: ReactElement
  className?: string
  blur?: number
}

export function Backlight({ blur = 20, children, className }: BacklightProps) {
  const id = useId()

  return (
    <div className={className}>
      <svg width="0" height="0" aria-hidden="true">
        <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur}
            result="blurred"
          ></feGaussianBlur>
          <feColorMatrix
            type="saturate"
            in="blurred"
            values="4"
          ></feColorMatrix>
          <feComposite in="SourceGraphic" operator="over"></feComposite>
        </filter>
      </svg>

      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </div>
  )
}
