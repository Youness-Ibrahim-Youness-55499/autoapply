export function Waves({ className = "h-[105px]" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`wave-wrap ${className}`}>
      <svg className="wave wave-one" preserveAspectRatio="none" viewBox="0 0 1200 180">
        <path d="M0 122C162 35 274 166 441 101c174-68 286 54 472-18 111-43 194-28 287-4v101H0Z" fill="#7de7c1" />
      </svg>
      <svg className="wave wave-two" preserveAspectRatio="none" viewBox="0 0 1200 180">
        <path d="M0 140C150 92 274 170 435 126c188-52 291 42 484-6 112-28 192-10 281 20v40H0Z" fill="#f4d871" />
      </svg>
      <svg className="wave wave-three" preserveAspectRatio="none" viewBox="0 0 1200 180">
        <path d="M0 156C169 95 277 146 443 121c190-29 292 24 480 5 126-13 203 6 277 30v24H0Z" fill="#c8f7e7" />
      </svg>
    </div>
  );
}
