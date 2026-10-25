import Link from 'next/link';

export default function Logo({ href = '/', light = false, compact = false }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5"
      aria-label="Martify home"
    >
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-night shadow-[0_8px_18px_-10px_rgba(23,24,21,0.8)]">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
          <path
            d="M7.5 23V11.5l5.1 5.6 3.2-7.1 3.2 7.1 5.4-5.6V23"
            fill="none"
            stroke="#ED5A22"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="25.6" r="1.4" fill="#FAF7F1" />
        </svg>
      </span>
      {!compact ? (
        <span
          className={`text-[20px] font-extrabold tracking-[-0.055em] ${light ? 'text-white' : 'text-ink'}`}
        >
          martify
        </span>
      ) : null}
    </Link>
  );
}
