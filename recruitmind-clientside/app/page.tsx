import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Icon({ children }: { children: React.ReactNode }) {
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">{children}</div>;
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative bg-gradient-to-b from-sky-tint via-white to-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_500px_at_82%_6%,rgba(138,209,247,0.55),transparent_60%),radial-gradient(500px_420px_at_8%_30%,rgba(255,203,71,0.28),transparent_60%)]" />
        <Navbar />

        <header className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-10 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-12">
          <div className="animate-[fade-up_.7s_ease_both]">
            <h1 className="max-w-[11ch] font-display text-5xl font-semibold leading-[1.12] text-navy sm:text-6xl">
              Show them who you really are.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-ink-soft sm:text-lg">
              You’ve been invited to complete a short RecruitMind assessment as part of your application. It’s your chance to show how you think — not just what’s on your resume.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/candidate/login" className="rounded-full bg-yellow px-7 py-4 font-bold text-navy-deep shadow-[0_12px_26px_rgba(255,203,71,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(255,203,71,0.5)]">
                Begin your assessment
              </Link>
              <Link href="#how" className="rounded-full border-2 border-navy px-7 py-3.5 font-bold text-navy transition hover:bg-navy hover:text-white">
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-sm font-semibold text-ink-soft">Takes about 5 minutes · goes straight to the hiring team</p>
          </div>

          <div className="mx-auto w-full max-w-[460px] animate-[float_7s_ease-in-out_infinite]">
            <svg viewBox="0 0 460 420" className="h-auto w-full" role="img" aria-label="A person walking along a path toward a sunny destination">
              <circle cx="340" cy="90" r="46" fill="#FFCB47" />
              <g stroke="#FFCB47" strokeWidth="6" strokeLinecap="round" opacity="0.7">
                <line x1="340" y1="20" x2="340" y2="4" />
                <line x1="400" y1="45" x2="412" y2="34" />
                <line x1="410" y1="90" x2="426" y2="90" />
              </g>
              <path d="M40 380C110 380 100 300 170 290C240 280 230 210 300 195C360 182 350 120 400 100" stroke="#0E3358" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="1 16" />
              <circle cx="40" cy="380" r="20" fill="#8AD1F7" />
              <circle cx="170" cy="290" r="26" fill="#CFEDFC" />
              <circle cx="300" cy="195" r="20" fill="#FFE7AE" />
              <circle cx="90" cy="345" r="16" fill="#0E3358" />
              <path d="M90 361v34M90 372l-16 20M90 372l16 20M90 375l-14-10M90 375l14-10" stroke="#0E3358" strokeWidth="5" strokeLinecap="round" />
              <path d="M400 100v-58" stroke="#0E3358" strokeWidth="5" strokeLinecap="round" />
              <path d="M400 42l34 14-34 14z" fill="#8AD1F7" />
            </svg>
          </div>
        </header>

        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="relative z-10 block h-16 w-full sm:h-20" aria-hidden="true">
          <path d="M0 40C240 90 480 0 720 30C960 60 1200 10 1440 40V90H0Z" fill="#EAF7FE" />
        </svg>
      </section>

      <section className="relative bg-sky-tint px-5 pb-20 pt-3 sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-yellow-soft/60" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">This isn’t a test you can fail.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-ink-soft sm:text-lg">
            There are no trick questions and no single right answer. The hiring team wants to understand how you think, communicate, and handle real situations — so they can see whether this role is genuinely a good fit for you, too.
          </p>
        </div>
      </section>

      <section id="how" className="bg-sky-tint px-5 pb-20 pt-8 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">What happens after you click start</h2>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-0">
            {[
              ["Complete your assessment", "Answer a few thoughtful prompts about how you approach work — at your own pace, wherever you are.", "✦"],
              ["We turn it into insight", "Your answers become a clear picture of your strengths for the hiring team to review.", "▥"],
              ["You move forward with confidence", "The hiring team sees the real you alongside your resume — helping them decide fairly, and faster.", "✓"],
            ].map(([title, text, symbol]) => (
              <div key={title} className="relative px-4 text-center">
                <div className="mx-auto mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-sky bg-white text-3xl font-bold text-navy shadow-[0_20px_45px_rgba(14,51,88,0.10)]">{symbol}</div>
                <h3 className="text-lg font-extrabold text-navy">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-7 text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">What the hiring team will see</h2>
            <p className="mt-4 text-base font-medium leading-7 text-ink-soft">One assessment, built to show more of you than a resume ever could.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Personality assessment", "How you think, communicate, and make decisions under real conditions.", "person"],
              ["Leadership evaluation", "Your natural ability to guide, support, and grow a team, if the role calls for it.", "star"],
              ["Video interviews", "A short response in your own voice, so your personality comes through too.", "video"],
              ["AI-powered insights", "Your responses are read fairly and consistently — no guesswork, no bias.", "spark"],
            ].map(([title, text, icon]) => (
              <div key={title} className="flex gap-5 rounded-[22px] bg-sky-tint p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_45px_rgba(14,51,88,0.10)] sm:p-8">
                <Icon>
                  <span className="text-2xl text-navy">{icon === "person" ? "◯" : icon === "star" ? "✦" : icon === "video" ? "▣" : "✺"}</span>
                </Icon>
                <div>
                  <h3 className="text-base font-extrabold text-navy sm:text-lg">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-7 text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[30px] bg-gradient-to-br from-navy to-navy-deep px-6 py-14 text-center sm:px-10 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-yellow/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky/25 blur-3xl" />
          <h2 className="relative mx-auto max-w-xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">You’re closer than you think.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base font-medium leading-8 text-[#BFE0F5] sm:text-lg">The hiring team is waiting to see what makes you the right fit. Let’s get started.</p>
          <Link href="/candidate/login" className="relative mt-8 inline-flex rounded-full bg-yellow px-7 py-4 font-bold text-navy-deep shadow-[0_12px_26px_rgba(255,203,71,0.4)] transition hover:-translate-y-0.5">
            Start my assessment
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
