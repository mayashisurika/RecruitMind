import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-[#F4EAE2] min-h-screen py-6 px-25 space-y-16 font-poppins">

      {/* Hero Section */}
      <section className="bg-[#00353A] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between text-white">
        {/* Text Content */}
        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl md:text-4xl font-fredoka font-bold leading-snug">
            “Empowering Better<br />
            Decisions Through<br />
            Deeper Understanding”
          </h1>
          <p className="text-[#F19A04] text-sm">
            Go beyond traditional hiring, assess what really matters
          </p>
          <Link
            href="/candidate/login"
            className="bg-[#F19A04] text-white px-8 py-3 rounded-2xl shadow-md w-fit"
          >
            Start
          </Link>
        </div>

        {/* Right Side Image */}
        <div className="mt-10 md:mt-0">
          <Image
            src="/landing-page/main-image.png" // Place your image inside /public
            alt="Main Image"
            width={300}
            height={300}
            className="rounded-xl"
          />
        </div>
      </section>

      {/* Testimonial / Insight Section */}
      <section
        className="py-6 px-6 rounded-2xl shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 testimonial-section-bg"
      >        
        {/* Left Image */}
        <Image
          src="/landing-page/image1.png"
          alt="Girl"
          width={150}
          height={150}
          className="rounded-full"
        />

        {/* Text Content */}
        <div className="text-center md:text-left max-w-xl space-y-2">
          <h2 className="text-lg md:text-xl font-bold text-[#0C2F37]">
            “RecruitMind connects insight with opportunity.”
          </h2>
          <p className="text-sm text-gray-700">
            Candidates get a fair, expressive platform to showcase their strengths, while
            employers gain valuable behavioral insights to make smarter, bias-free decisions.
          </p>
        </div>

        {/* Right Image */}
        <Image
          src="/landing-page/image2.png"
          alt="Boy"
          width={150}
          height={150}
          className="rounded-full"
        />
      </section>

    </main>
  );
}
