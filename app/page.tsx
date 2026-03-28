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
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 blur-[150px] rounded-full opacity-30 animate-pulse-slow" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-tertiary/10 blur-[150px] rounded-full opacity-20" />
        </div>

        {/* Navigation */}
        <header>
          <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-8" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-3" aria-label="Ethereal Techno Home">
              <Image 
                src="/logo.svg" 
                alt="Ethereal Techno" 
                width={32} 
                height={32} 
                className="h-8 w-auto" 
                priority 
              />
            </Link>
            <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-widest">
              <Link href="/signin" className="text-white/60 hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors">
                Join Circle
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center pt-12 md:pt-0" aria-labelledby="hero-heading">
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

        <footer className="relative z-10 w-full py-8 px-8 border-t border-white/5 text-center text-white/30 text-[10px] uppercase font-mono tracking-widest">
          &copy; {new Date().getFullYear()} Ethereal Techno. All rights reserved.
        </footer>
      </main>
    </>
  );
}
