import Link from "next/link";

function BrandMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#0A2540" />
      <path
        d="M24 12c-5 0-9 3.6-9 9 0 3 1.5 5.4 3.6 7.1-.2 1.4-.9 2.7-2 3.8a.6.6 0 00.5 1c2.5-.3 4.6-1.3 6.2-2.7.9.2 1.8.3 2.7.3 5 0 9-3.6 9-9s-4-9.5-11-9.5z"
        fill="#BFE0F5"
      />
      <circle cx="20" cy="21" r="1.6" fill="#0A2540" />
      <circle cx="27" cy="21" r="1.6" fill="#0A2540" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-navy-deep px-5 py-14 text-[#B9D6E8] sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 border-b border-white/10 pb-9 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
              <BrandMark />
              RecruitMind
            </Link>
            <p className="mt-4 max-w-xs text-sm font-medium leading-7 text-[#8FB4CC]">
              Behavioral assessments that help people show their strengths and help teams hire on fit, not guesswork.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Quick links</h3>
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <Link href="/" className="transition hover:text-yellow">Home</Link>
              <Link href="#how" className="transition hover:text-yellow">How it works</Link>
              <Link href="#features" className="transition hover:text-yellow">Features</Link>
              <Link href="/admin/login" className="transition hover:text-yellow">Admin login</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Connect</h3>
            <a href="mailto:support@recruitmind.com" className="text-sm font-semibold transition hover:text-yellow">
              support@recruitmind.com
            </a>
          </div>
        </div>

        <p className="pt-6 text-center text-xs font-semibold text-[#6D93AC]">
          © 2026 RecruitMind. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
