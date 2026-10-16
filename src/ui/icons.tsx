import type { ReactNode } from 'react'

type IconProps = { className?: string }

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  )
}

export function IconSearch() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="6.25" />
      <path d="M16.2 16.2 21 21" />
    </Svg>
  )
}

export function IconPin() {
  return (
    <Svg>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="1.6" />
    </Svg>
  )
}

export function IconClose() {
  return (
    <Svg>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  )
}
