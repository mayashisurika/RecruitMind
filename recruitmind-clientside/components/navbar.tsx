"use client";

import Link from "next/link";
import { useState } from "react";

function BrandMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#FFE7AE" />
      <path
        d="M24 12c-5 0-9 3.6-9 9 0 3 1.5 5.4 3.6 7.1-.2 1.4-.9 2.7-2 3.8a.6.6 0 00.5 1c2.5-.3 4.6-1.3 6.2-2.7.9.2 1.8.3 2.7.3 5 0 9-3.6 9-9s-4-9.5-11-9.5z"
        fill="#0E3358"
      />
      <circle cx="20" cy="21" r="1.6" fill="#FFE7AE" />
      <circle cx="27" cy="21" r="1.6" fill="#FFE7AE" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-50 py-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-navy sm:text-2xl">
          <BrandMark />
          RecruitMind
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <Link href="#how" className="font-semibold text-ink transition hover:text-navy">
            How it works
          </Link>
          <Link href="#features" className="font-semibold text-ink-soft transition hover:text-navy">
            Features
          </Link>
          <Link href="/admin/login" className="font-semibold text-ink-soft transition hover:text-navy">
            Admin login
          </Link>
          <Link
            href="/candidate/login"
            className="rounded-full bg-navy px-7 py-3.5 font-bold text-white shadow-[0_12px_26px_rgba(14,51,88,0.22)] transition hover:-translate-y-0.5 hover:bg-navy-deep"
          >
            Start test
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={Boolean(open)}
          aria-controls="mobile-navigation-menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-navy/15 p-2.5 text-navy lg:hidden"
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="my-1.5 block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation-menu"
          className="mx-5 mt-4 rounded-3xl border border-navy/10 bg-white p-5 shadow-xl lg:hidden"
        >
          <div className="flex flex-col gap-4">
            <Link href="#how" onClick={() => setOpen(false)} className="font-semibold text-ink">
              How it works
            </Link>
            <Link href="#features" onClick={() => setOpen(false)} className="font-semibold text-ink">
              Features
            </Link>
            <Link href="/admin/login" onClick={() => setOpen(false)} className="font-semibold text-ink">
              Admin login
            </Link>
            <Link
              href="/candidate"
              onClick={() => setOpen(false)}
              className="rounded-full bg-navy px-6 py-3 text-center font-bold text-white"
            >
              Start test
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
