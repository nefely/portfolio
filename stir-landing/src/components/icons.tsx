type IconProps = { className?: string }

export function StirLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 70 30" fill="none" className={className} aria-hidden="true">
      <path
        transform="translate(53.236 8.037)"
        d="M15.177 8.27329C15.4197 8.27329 16.2084 8.28279 16.7498 8.40199L16.7638 0.10491C16.3064 0.0381499 15.8397 0 15.3824 0C14.2343 0 13.2822 0.20027 12.5589 0.60559C10.0667 2.01229 9.4553 3.33789 9.0773 7.20519L9.068 7.31009L8.1206 7.31009L8.1346 0.262259L0.0419998 0.24796L0 21.1005L8.2839 21.1195L8.2979 14.6535C8.3072 10.648 10.8787 8.26379 15.177 8.27329Z"
        fill="currentColor"
      />
      <path
        transform="translate(40.3693 8.25635)"
        d="M10.4074 20.8715L10.4494 0.0190706L0.0139999 0L0 6.21335L2.1515 6.21805L2.1235 20.8525L10.4074 20.8715Z"
        fill="currentColor"
      />
      <path
        transform="translate(22.350078 3.56885)"
        d="M10.3094 15.1924L10.3 19.3505C10.3 20.0657 9.73072 20.6474 9.03062 20.6474C8.33062 20.6474 7.76122 20.0657 7.76122 19.3505L7.77522 10.872L15.2564 10.8864L15.2704 4.69693L7.78922 4.68263L7.79852 0L0.0280204 3.34746L2.0503e-05 18.0821C-0.0092795 23.0508 3.14562 25.9023 8.66192 25.9165C14.1456 25.9261 17.8419 22.7932 17.8465 18.1201L17.8512 15.2113L10.3094 15.1924Z"
        fill="currentColor"
      />
      <path
        transform="translate(42.000546 0.51709)"
        d="M9.29886 2.90399C9.35026 4.05796 8.51956 4.87814 7.54416 5.27392C6.54076 5.69354 5.48136 5.78891 4.65056 5.80799C3.82456 5.78891 2.76516 5.68878 1.75706 5.27392C0.781655 4.87814 -0.0490437 4.05796 0.00225631 2.90399C-0.0490437 1.75003 0.781655 0.92985 1.75706 0.53407C2.76046 0.114443 3.81986 0.019074 4.65056 0C5.47666 0.019074 6.53606 0.119211 7.54416 0.53407C8.51956 0.92985 9.35026 1.75003 9.29886 2.90399Z"
        fill="currentColor"
      />
      <path
        transform="translate(0 7.302734)"
        d="M13.4502 9.14127L10.7387 8.51657C8.95126 8.08267 8.95126 6.80467 8.95126 6.80467C8.95126 4.83527 10.8134 4.83527 10.8134 4.83527C11.8401 4.83527 12.6755 5.75087 12.6755 6.80467L20.6514 6.80467C20.4367 2.41769 16.8898 0.00961575 10.6407 7.57534e-05C6.85579 -0.00946425 3.89226 0.882245 2.07681 2.57028C0.905394 3.65747 0.280019 5.09277 0.280019 6.71887C0.280019 9.83747 2.10481 11.9403 5.87573 12.7844L10.58 13.8382C10.58 13.8382 10.58 13.8382 10.5847 13.8382C11.4154 14.0432 12.4002 14.2435 12.4188 15.1257C12.4002 17.7388 8.71325 17.7293 8.69458 15.1257L0 15.1114C0.00933396 19.6796 3.61224 22.2021 10.1553 22.2116C13.9076 22.2212 16.7451 21.3533 18.5839 19.6414C19.788 18.5208 20.3807 17.1094 20.3807 15.326C20.3807 12.1549 18.3786 10.2618 13.4502 9.14127Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 11 12 4l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 15.2c.4.9 1.3 1.5 2.5 1.5 1.6 0 2.8-.9 2.8-2.2 0-3-5.6-1.4-5.6-4.5 0-1.3 1.2-2.2 2.8-2.2 1.2 0 2.1.6 2.5 1.5M12 6.5v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function SplitsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="9" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="10" y="4" width="4" height="15" rx="1.5" fill="currentColor" />
      <rect x="16" y="12" width="4" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function CollectivesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="16" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 21 16" fill="none" className={className} aria-hidden="true">
      <path d="M1 8.5 7 14 19.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 16" fill="none" className={className} aria-hidden="true">
      <path d="M1 8h17M11 1l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronIcon({ className, direction = 'left' }: IconProps & { direction?: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function TwitterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4 4 0 0 0 1.3 5.5c-.6 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.9 2.9A8.3 8.3 0 0 1 2 18.6a11.6 11.6 0 0 0 6.3 1.9c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2Z" />
    </svg>
  )
}

export function YoutubeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 7.5v9l8-4.5-8-4.5Z" fill="white" />
    </svg>
  )
}

export function PatreonGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="15" cy="9.5" r="6.5" fill="white" />
      <rect x="4" y="3" width="3.2" height="18" fill="white" />
    </svg>
  )
}

export function ShopifyGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 8.5 8 4h8l2 4.5-1 11.5H7L6 8.5Z" fill="white" />
      <path d="M14 8c0-2-1-3-2-3s-2 1.3-2 3" stroke="black" strokeOpacity="0.3" strokeWidth="1.3" />
    </svg>
  )
}

export function AnchorGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 10a4 4 0 0 1 8 0M12 10v9M8.5 15.5H15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function StripeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15.5 9.6c0-.9-.8-1.3-2-1.3-1.6 0-3.3.6-4.4 1.2l.4-2.7c1-.5 2.6-1 4.4-1 1.5 0 2.8.4 3.6 1.1.9.8 1.4 1.9 1.4 3.3 0 2.4-1.7 3.9-4.3 4.9-1.5.6-2 1-2 1.6 0 .8.7 1.2 2 1.2 1.5 0 3-.5 4.2-1.2l-.4 2.8c-1.1.6-2.6 1-4.1 1-3.2 0-5.2-1.6-5.2-4.3 0-2.2 1.5-3.6 4-4.6 1.7-.6 2.4-1 2.4-1.9Z"
        fill="white"
      />
    </svg>
  )
}

export function OnlyFansGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.6" fill="white" />
    </svg>
  )
}

export function SpotifyGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6.5 10c3.5-1 8-.6 10.5.9M6.8 13.2c2.9-.8 6.4-.5 8.7.8M7.2 16.2c2.4-.6 5.1-.4 7 .7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function FacebookGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.2l.3-2.6h-2.5V9.7c0-.8.2-1.3 1.3-1.3h1.3V6.1c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.3v1.9H8.8v2.6H11v7h2.5Z" fill="white" />
    </svg>
  )
}

export function SubstackGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6h12v1.8H6V6Zm0 3.4h12V11H6V9.4ZM6 18l6-3.3 6 3.3v-4.2H6V18Z" fill="white" />
    </svg>
  )
}

export function TwitchGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 4h13v9.5L16.5 17H13l-2.5 2.5H8V17H5V7l2-3Z"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 8v3.5M15.5 8v3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function TikTokGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.2 6.5c.3 1.4 1.2 2.3 2.8 2.4v1.9c-1 .1-1.9-.2-2.8-.8v3.9a3.6 3.6 0 1 1-3.6-3.6c.2 0 .4 0 .6.1v1.9a1.7 1.7 0 1 0 1.2 1.6V6.5h1.8Z"
        fill="white"
      />
    </svg>
  )
}
