'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Feed' },
  { href: '/discover', label: 'Discover' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="press-rule sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="Glitched — home"
          className="group flex items-center gap-1.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <span className="relative inline-flex shrink-0">
            <svg viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges" className="h-5 w-5 sm:h-6 sm:w-6">
              <defs>
                <g id="hdr-g">
                  <rect x="4" y="0" width="24" height="4" />
                  <rect x="0" y="4" width="8" height="4" />
                  <rect x="24" y="4" width="8" height="4" />
                  <rect x="0" y="8" width="8" height="4" />
                  <rect x="0" y="12" width="8" height="4" />
                  <rect x="0" y="16" width="8" height="4" />
                  <rect x="16" y="16" width="16" height="4" />
                  <rect x="0" y="20" width="8" height="4" />
                  <rect x="24" y="20" width="8" height="4" />
                  <rect x="0" y="24" width="8" height="4" />
                  <rect x="24" y="24" width="8" height="4" />
                  <rect x="4" y="28" width="24" height="4" />
                </g>
                <clipPath id="hdr-a">
                  <rect x="0" y="4" width="32" height="13" />
                </clipPath>
                <clipPath id="hdr-b">
                  <rect x="0" y="16" width="32" height="12" />
                </clipPath>
              </defs>
              <g clipPath="url(#hdr-a)">
                <g className="chan-a" transform="translate(-2 0)">
                  <use href="#hdr-g" fill="#C9302C" />
                </g>
              </g>
              <g clipPath="url(#hdr-b)">
                <g className="chan-b" transform="translate(2 0)">
                  <use href="#hdr-g" fill="#B98A2E" />
                </g>
              </g>
              <use href="#hdr-g" fill="#F5F3EE" />
              <rect x="0" y="0" width="4" height="4" fill="#C9302C" />
              <rect x="28" y="8" width="4" height="4" fill="#B98A2E" />
            </svg>
          </span>
          <span className="wordmark font-logo text-base leading-none sm:text-lg">
            litched
          </span>
          <span className="ml-3 hidden items-center font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/60 sm:flex">
            Westminster
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1 sm:gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`kicker px-2.5 py-2 transition-colors duration-100 hover:bg-gold hover:text-ink ${
                  active ? 'bg-gold/15 text-gold' : 'text-paper/70'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}