import { useId, type ReactNode } from "react";

// Jobman icon system (24x24 grid). Each glyph has two renderings:
//   - outline: neutral 2px line icon, used for the inactive state
//   - filled:  solid Jobman green shapes with gold accents, used when active
// Outline geometry comes from the "Jobman Futuristic Navigation Icons" pack;
// the filled versions follow the "Icons for What's Next" reference sheet
// (hybrid filled + outline, primary #065F46, teal #10B981, gold #F4B400).
// Keep new navigation icons in this set rather than mixing icon libraries.

const PRIMARY = "#065F46";
const TEAL = "#10B981";
const GOLD = "#F4B400";
const INACTIVE_STROKE = "#94A3B8";
// White at partial opacity reads as a "cut-out" detail on any surface.
const DETAIL = "rgba(255,255,255,.72)";
const SOFT_DETAIL = "rgba(255,255,255,.4)";

const BOOK_LEFT = "M4 5.5c3.3-.8 5.9-.2 8 1.7v13c-2.1-1.9-4.7-2.5-8-1.7Z";
const BOOK_RIGHT = "M20 5.5c-3.3-.8-5.9-.2-8 1.7v13c2.1-1.9 4.7-2.5 8-1.7Z";
const BUBBLE =
  "M21 11.5c0 4.7-4 8.5-9 8.5a10.8 10.8 0 0 1-3.6-.6L4 21l1.4-3.5A8 8 0 0 1 3 11.5C3 6.8 7 3 12 3s9 3.8 9 8.5Z";
const STAR = "m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z";
const GEAR_RING =
  "M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.4-2-3.4-2.4 1a8.5 8.5 0 0 0-2.6-1.5L14 2.6h-4l-.4 2.6A8.5 8.5 0 0 0 7 6.7l-2.4-1-2 3.4 2 1.4a7.6 7.6 0 0 0 0 3l-2 1.4 2 3.4 2.4-1a8.5 8.5 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a8.5 8.5 0 0 0 2.6-1.5l2.4 1 2-3.4Z";
const GEAR_HOLE = "M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z";

type Glyph = {
  // Rendered inside a group that already supplies the green gradient fill/stroke.
  filled: ReactNode;
  outline: ReactNode;
};

const glyphs = {
  "ai-assistant": {
    filled: (
      <>
        <path d="M12 2.5c1.3 3.8 3.1 5.6 7 7-3.9 1.4-5.7 3.2-7 7-1.3-3.8-3.1-5.6-7-7 3.9-1.4 5.7-3.2 7-7Z" />
        <path d="M19 2.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" fill={GOLD} stroke={GOLD} strokeWidth="0.6" />
      </>
    ),
    outline: (
      <>
        <path d="M12 2.5c1.3 3.8 3.1 5.6 7 7-3.9 1.4-5.7 3.2-7 7-1.3-3.8-3.1-5.6-7-7 3.9-1.4 5.7-3.2 7-7Z" />
        <path d="M19 3v3M17.5 4.5h3" />
      </>
    ),
  },
  applications: {
    filled: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3l4 4h-4Z" fill={GOLD} stroke={GOLD} strokeWidth="0.8" />
        <path d="M10 12h5M10 16h5" fill="none" stroke={DETAIL} strokeWidth="1.6" />
      </>
    ),
    outline: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M10 12h5M10 16h5" />
      </>
    ),
  },
  "career-insights": {
    filled: (
      <>
        <rect fill={PRIMARY} height="7" rx="1.2" stroke={PRIMARY} width="3.5" x="4.25" y="13" />
        <rect fill={TEAL} height="11" rx="1.2" stroke={TEAL} width="3.5" x="10.25" y="9" />
        <rect fill={GOLD} height="16" rx="1.2" stroke={GOLD} width="3.5" x="16.25" y="4" />
      </>
    ),
    outline: (
      <>
        <rect height="7" rx="1.2" width="3.5" x="4.25" y="13" />
        <rect height="11" rx="1.2" width="3.5" x="10.25" y="9" />
        <rect height="16" rx="1.2" width="3.5" x="16.25" y="4" />
      </>
    ),
  },
  "cv-optimizer": {
    filled: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3l4 4h-4Z" fill={SOFT_DETAIL} stroke="none" />
        <path d="M9 12h5M9 16h4" fill="none" stroke={DETAIL} strokeWidth="1.6" />
        <path
          d="m18 12.6.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z"
          fill={GOLD}
          stroke={GOLD}
          strokeWidth="0.6"
        />
      </>
    ),
    outline: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h5M9 16h4" />
        <path d="m18 13 .6 1.5L20 15l-1.4.6L18 17l-.6-1.4L16 15l1.4-.5Z" />
      </>
    ),
  },
  dashboard: {
    filled: (
      <path
        d="M3 10.7 12 3l9 7.7v8.8a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5Z M9.2 20.2v-5.5a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v5.5Z"
        fillRule="evenodd"
      />
    ),
    outline: <path d="M3 10.7 12 3l9 7.7v8.8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5Z" />,
  },
  learning: {
    filled: (
      <>
        <path d={BOOK_LEFT} />
        <path d={BOOK_RIGHT} />
        <path d="M12 7.6v11.6" fill="none" stroke={GOLD} strokeWidth="1.4" />
      </>
    ),
    outline: (
      <>
        <path d={BOOK_LEFT} />
        <path d={BOOK_RIGHT} />
      </>
    ),
  },
  matches: {
    filled: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.4-4 2.6-6 5.5-6s5.1 2 5.5 6Z" />
        <circle cx="16.5" cy="9.5" r="2.4" fill={GOLD} stroke={GOLD} strokeWidth="0.8" />
        <path d="M14 15.2c2.9-.2 5 1.6 5.6 4.8" fill="none" stroke={GOLD} strokeWidth="2" />
      </>
    ),
    outline: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="16.5" cy="9.5" r="2.4" />
        <path d="M3.5 20c.4-4 2.6-6 5.5-6s5.1 2 5.5 6M14 15.2c2.9-.2 5 1.6 5.6 4.8" />
      </>
    ),
  },
  notifications: {
    filled: (
      <>
        <path d="M5 17h14l-1.5-2.5V10a5.5 5.5 0 0 0-11 0v4.5Z" />
        <path d="M10 20h4" fill="none" strokeWidth="2" />
        <circle cx="18.6" cy="5.2" r="2.2" fill={GOLD} stroke={GOLD} strokeWidth="0.6" />
      </>
    ),
    outline: (
      <>
        <path d="M5 17h14l-1.5-2.5V10a5.5 5.5 0 0 0-11 0v4.5Z" />
        <path d="M10 20h4" />
      </>
    ),
  },
  opportunities: {
    filled: (
      <>
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" fill="none" strokeWidth="2" />
        <rect height="12" rx="2.2" width="16" x="4" y="7" />
        <path d="M4 11h16" fill="none" stroke={SOFT_DETAIL} strokeWidth="1.2" />
        <rect fill={GOLD} height="3.6" rx="1" stroke={GOLD} strokeWidth="0.6" width="5" x="9.5" y="9.6" />
      </>
    ),
    outline: (
      <>
        <rect height="12" rx="2.2" width="16" x="4" y="7" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 11h16M9 14h6" />
      </>
    ),
  },
  profile: {
    filled: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.6-4.6 3.1-7 7-7s6.4 2.4 7 7Z" />
      </>
    ),
    outline: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.6-4.6 3.1-7 7-7s6.4 2.4 7 7" />
      </>
    ),
  },
  "saved-jobs": {
    filled: <path d={STAR} fill={GOLD} stroke={GOLD} />,
    outline: <path d={STAR} />,
  },
  search: {
    filled: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" fill="rgba(16,185,129,.16)" strokeWidth="2" />
        <path d="m15.2 15.2 5 5" fill="none" stroke={GOLD} strokeWidth="2.4" />
      </>
    ),
    outline: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.2 15.2 5 5" />
      </>
    ),
  },
  settings: {
    filled: <path d={`${GEAR_RING} ${GEAR_HOLE}`} fillRule="evenodd" />,
    outline: (
      <>
        <path d={GEAR_HOLE} />
        <path d={GEAR_RING} />
      </>
    ),
  },
  support: {
    filled: (
      <>
        <path d={BUBBLE} />
        <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" fill="none" stroke={GOLD} strokeWidth="2" />
      </>
    ),
    outline: (
      <>
        <path d={BUBBLE} />
        <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
      </>
    ),
  },
} satisfies Record<string, Glyph>;

export type JobmanIconName = keyof typeof glyphs;

type JobmanIconProps = {
  active?: boolean;
  className?: string;
  name: JobmanIconName;
  title?: string;
};

// Decorative by default (the label sits next to the icon); pass `title` when
// the icon stands alone.
export function JobmanIcon({ active = false, className = "size-5 shrink-0", name, title }: JobmanIconProps) {
  const id = useId().replace(/:/g, "");
  const gradientId = `jm-${id}-fill`;
  const glyph: Glyph = glyphs[name];

  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
      role={title ? "img" : undefined}
      style={active ? { filter: "drop-shadow(0 1px 1.5px rgba(6,95,70,.3))" } : undefined}
      viewBox="0 0 24 24"
    >
      {active ? (
        <>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id={gradientId} x1="4" x2="20" y1="3" y2="21">
              <stop offset="0" stopColor="#0D9668" />
              <stop offset="1" stopColor={PRIMARY} />
            </linearGradient>
          </defs>
          {/* Solid shapes carry a thin same-color stroke to soften their corners. */}
          <g
            fill={`url(#${gradientId})`}
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          >
            {glyph.filled}
          </g>
        </>
      ) : (
        <g stroke={INACTIVE_STROKE} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          {glyph.outline}
        </g>
      )}
    </svg>
  );
}
