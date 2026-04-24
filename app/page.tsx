"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { ArrowRight, Music, Users } from "lucide-react";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);
const MotionH1 = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.h1),
  { ssr: false }
);
const MotionP = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.p),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8
    }
  })
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ethereal Techno",
  url: "https://etherealtechno.com",
  description:
    "A curated sound library and creative circle for producers and listeners who value depth, emotion, and artistic identity.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://etherealtechno.com/libraries?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://grainy-gradients.vercel.app" />
        <link rel="dns-prefetch" href="https://grainy-gradients.vercel.app" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://ethereal-techno-storage.s3.eu-west-1.amazonaws.com" />
      </Head>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-primary selection:text-black">

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-primary/10 blur-[150px] rounded-full opacity-30" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[750px] max-h-[750px] bg-tertiary/10 blur-[150px] rounded-full opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>


        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-12 md:pt-0" aria-labelledby="hero-heading">
          <div className="max-w-5xl mx-auto flex flex-col items-center">

            <MotionDiv
              custom={0} initial="hidden" animate="visible" variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
            >

              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">A New Movement</span>
            </MotionDiv>

            <MotionH1
              id="hero-heading"
              custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="font-main text-[12vw] md:text-[8vw] uppercase leading-[0.85] tracking-tight mb-8"
            >
              Enter The<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Ethereal</span>
            </MotionH1>

            <MotionP
              custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="text-lg md:text-2xl text-white/50 font-light max-w-2xl leading-relaxed mb-12"
            >
              A curated sound library and creative circle for producers and listeners who value depth, emotion, and artistic identity.
            </MotionP>

            <MotionDiv
              custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href="/community" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                Explore Community <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link href="/libraries" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">
                Explore Sounds
              </Link>
            </MotionDiv>

          </div>
        </section>

        {/* Value Pillars */}
        <section className="relative z-10 py-24 px-6 md:px-12 border-t border-white/5 bg-white/[0.02]" aria-labelledby="pillars-heading">
          <h2 id="pillars-heading" className="sr-only">Why Ethereal Techno</h2>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            <MotionDiv
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex flex-col gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                <Music className="w-8 h-8" />
              </div>
              <h3 className="font-main text-4xl uppercase">Sound evolved.</h3>
              <p className="text-white/50 leading-relaxed text-lg font-light">
                Access premium construction kits, exclusive samples, and stems designed for the modern melodic and ethereal techno producer. Elevate your tracks with sounds crafted by industry professionals.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex flex-col gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary" aria-hidden="true">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-main text-4xl uppercase">The Inner Circle.</h3>
              <p className="text-white/50 leading-relaxed text-lg font-light">
                Ethereal Techno is more than a sound - it&apos;s a shared space for verified producers to connect, exchange feedback, and collaborate inside the private Circle.
              </p>
            </MotionDiv>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="relative z-10 py-32 px-6 text-center text-white overflow-hidden" aria-labelledby="cta-heading">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 id="cta-heading" className="font-main text-6xl md:text-8xl uppercase mb-8 leading-[0.9]">Start Your<br />Journey</h2>
            <Link href="/signup" className="flex items-center justify-center gap-2 bg-primary text-black px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_40px_rgba(232,209,36,0.2)]">
              Create Free Account <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* The Vision Section */}
        <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-black" aria-labelledby="vision-heading">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Background Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-main text-white/[0.02] leading-none pointer-events-none select-none z-0">
              ETHEREAL
            </div>

            <div className="relative z-10">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary mb-12"
              >
                THE VISION
              </MotionDiv>

              <MotionH1
                id="vision-heading"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
                className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl mb-12 tracking-tight"
              >
                A sound that was never designed<br />
                <span className="text-transparent font-light bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/70 italic">— only discovered.</span>
              </MotionH1>

              <div className="space-y-8 text-white/50 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto">
                <MotionP initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                  Ethereal Techno didn&apos;t start as a genre. It emerged over time — shaped by atmosphere, emotion, and a deeper approach to electronic music.
                </MotionP>
                <MotionP initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
                  What began within Steyoyoke as something undefined was eventually recognized for what it truly was: a sound that lives between structure and feeling, between techno and something more ethereal.
                </MotionP>
                <MotionP initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="text-white border-y-[1px] border-white/10 py-10">
                  Today, Ethereal Techno is no longer just a sound.<br />
                  <span className="text-primary font-medium">It is an identity.</span>
                </MotionP>
                <MotionP initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}>
                  This project exists to give that identity a home — connecting music, sound design, and a curated circle of artists who share the same vision.
                </MotionP>
              </div>
            </div>
          </div>
        </section>

        {/* The Team Section */}
        <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-black" aria-labelledby="team-heading">
          <div className="max-w-6xl mx-auto text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary mb-8"
            >
              THE TEAM
            </MotionDiv>

            <MotionH1
              id="team-heading"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
              className="font-main text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-4"
            >
              BEHIND THE SOUND
            </MotionH1>

            <MotionP
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/50 text-lg md:text-xl font-light max-w-2xl mx-auto mb-20"
            >
              A collective of artists shaping the sound and identity of Ethereal Techno.
            </MotionP>

            {/* Core Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-24 mb-20 max-w-3xl mx-auto justify-items-center">
              <MotionDiv initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border border-white/10 bg-white/5">
                  <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/20">
                    <Users className="w-12 h-12" />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-2xl uppercase tracking-wide">Soul Button</h3>
                  <p className="text-primary text-xs font-mono uppercase tracking-widest">THE VISION</p>
                </div>
              </MotionDiv>

              <MotionDiv initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border border-white/10 bg-white/5">
                  <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/20">
                    <Users className="w-12 h-12" />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-2xl uppercase tracking-wide">Joel</h3>
                  <p className="text-primary text-xs font-mono uppercase tracking-widest">THE ENGINE</p>
                </div>
              </MotionDiv>
            </div>

            {/* Collective Team Divider */}
            <div className="flex items-center justify-center gap-4 mb-16 opacity-50">
              <div className="h-[2px] w-6 bg-white/50"></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/100">THE COLLECTIVE</span>
              <div className="h-[2px] w-6 bg-white/50"></div>
            </div>

            {/* Collective Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 sm:gap-x-8 gap-y-12 max-w-5xl mx-auto justify-items-center">
              {['Monarke', 'Navid Kaya', 'Clawz SG', 'Deviu', 'René Diehl', 'Martín Dubiansky', 'MPathy', 'Soelaas', 'Artist 9', 'Artist 10'].map((name, i) => (
                <MotionDiv key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * i }} className="flex flex-col items-center gap-4 w-28 md:w-36">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/10 bg-white/5">
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/20">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-sans font-semibold text-base uppercase text-center tracking-wide">{name}</h3>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-black overflow-hidden" aria-labelledby="newsletter-heading">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-main text-white/[0.015] leading-none pointer-events-none select-none z-0">
            SIGNAL
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary mb-8"
            >
              JOIN THE SIGNAL
            </MotionDiv>

            <MotionH1
              id="newsletter-heading"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
              className="font-main text-5xl md:text-7xl uppercase tracking-tight mb-6"
            >
              STAY IN THE LOOP
            </MotionH1>

            <MotionP
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/50 text-lg md:text-xl font-light mb-12"
            >
              New drops, exclusive samples, and Circle updates — straight to your inbox.
            </MotionP>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
                <button type="submit" className="bg-primary text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform whitespace-nowrap">
                  SUBSCRIBE <ArrowRight className="w-4 h-4 inline-block ml-1 -mt-1" />
                </button>
              </form>
              <p className="mt-6 text-[10px] text-white/30 font-mono uppercase tracking-widest">No spam. Unsubscribe anytime.</p>
            </MotionDiv>
          </div>
        </section>

        <footer className="relative z-10 w-full py-8 px-8 border-t border-white/5 text-center text-white/30 text-[10px] uppercase font-mono tracking-widest">
          &copy; {new Date().getFullYear()} Ethereal Techno. All rights reserved.
        </footer>
      </main>
    </>
  );
}
