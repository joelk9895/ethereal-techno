"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Lock,
    ArrowUpRight
} from "lucide-react";
import { getAuthUser, AuthUser } from "@/lib/auth";
import { motion } from "framer-motion";

// --- Animation Variants ---
const textRevealVar = {
    initial: { y: "100%" },
    enter: (i: number) => ({
        y: "0%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: i * 0.07 }
    })
};

export default function FreePage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isVerifiedProducer, setIsVerifiedProducer] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const authUser = getAuthUser();
        setUser(authUser);
        const verified = authUser?.type === "ARTIST" || authUser?.type === "ADMIN";
        setIsVerifiedProducer(verified);

        if (verified) {
            router.push("/free/content");
        }
    }, [router]);

    if (isVerifiedProducer) {
        return null;
    }

    return (
        <div ref={containerRef} className="bg-black min-h-screen text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans">

            {/* --- Fixed Background Texture & Noise --- */}
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] brightness-100 contrast-150"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] opacity-20 animate-pulse-slow"></div>
            </div>

            {/* --- Navigation --- */}
            <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-50 mix-blend-difference">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-white/20 rounded-full bg-black/50 backdrop-blur-md">
                        <Lock className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Restricted Access</span>
                </div>
                <div className="hidden md:block text-[10px] font-mono opacity-50 tracking-widest">
                    [ ETHEREAL // VAULT ]
                </div>
            </nav>

            {/* --- Section 1: The Hook (Massive Typography) --- */}
            <section className="relative z-10 min-h-screen flex flex-col justify-center px-4 md:px-10 pt-24">
                <div className="w-full">
                    {/* Adjusted for Anton: Viewport units (vw) ensures it fills width regardless of condensed font */}
                    <MaskedText
                        text={["FREE PACKS ARE", "AVAILABLE ONLY TO", "VERIFIED PRODUCERS"]}
                        className="font-main text-[11.5vw] leading-snug uppercase text-white block mt-[-1vw]"
                    />

                    <div className="mt-12 md:mt-16 flex flex-col md:flex-row gap-8 items-start md:items-center pl-2 md:pl-4">
                        <div className="h-px w-16 md:w-32 bg-primary/60"></div>
                        <p className="text-lg md:text-2xl text-white/70 max-w-2xl font-light leading-relaxed">
                            Ethereal Techno isn&apos;t just another sample store.<br />
                            It&apos;s a curated <span className="text-primary font-medium">creative culture</span>.
                        </p>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-4 mix-blend-difference"
                >
                    <span className="text-[9px] uppercase tracking-[0.2em] -rotate-90 origin-center translate-y-4">Scroll</span>
                    <div className="w-px h-24 bg-white/10 overflow-hidden">
                        <motion.div
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-full h-1/2 bg-primary"
                        />
                    </div>
                </motion.div>
            </section>

            {/* --- Section 2: The Manifesto --- */}
            <section className="relative z-10 py-40 px-4 md:px-12 border-t border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

                    {/* Left: Sticky Badge */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-32 pl-2">
                            <span className="text-[10px] text-primary font-mono uppercase tracking-widest">
                                01 // Philosophy
                            </span>
                        </div>
                    </div>

                    {/* Right: The Content */}
                    <div className="lg:col-span-9 flex flex-col gap-32">

                        {/* Statement 1 */}
                        <ManifestoItem
                            title="NOT A MARKETPLACE"
                            subtitle="IT'S A MOVEMENT"
                            description="Our free content is reserved for verified producers who share our sound, vision, and philosophy."
                        />

                        {/* Statement 2 */}
                        <ManifestoItem
                            title="THE CIRCLE"
                            subtitle="SHAPING THE FUTURE"
                            description="Each artist in our circle helps shape the future of Ethereal Techno — a space built on authenticity, emotion, and artistic depth."
                        />

                        {/* Statement 3 - Impact */}
                        <div className="relative py-10">
                            <h2 className="font-main text-[10vw] leading-[90%] uppercase text-white mb-6">
                                Do you reflect <br />
                                <span className="text-primary">this essence?</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-white/50 max-w-xl font-light leading-relaxed">
                                If your music embodies this depth, you are invited to apply to join the circle.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- Section 3: The Massive CTA --- */}
            <section className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 border-t border-white/5 bg-white/[0.02]">
                <div className="w-full max-w-full mx-auto text-center">

                    {user ? (
                        user.type === "USER" ? (
                            <BigLink href="/artist/apply" title="JOIN THE CIRCLE" sub="START APPLICATION" router={router} />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-6 opacity-40">
                                <Lock className="w-16 h-16 mb-2 text-primary" />
                                <h2 className="font-main text-[8vw] uppercase leading-none">Pending Review</h2>
                                <p className="font-mono text-sm tracking-widest">WE ARE CURRENTLY REVIEWING YOUR SUBMISSION</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            <BigLink href="/signup" title="JOIN THE CIRCLE" sub="GET STARTED" router={router} />

                            <div className="mt-12">
                                <button
                                    onClick={() => router.push("/signin")}
                                    className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors"
                                >
                                    <span className="w-2 h-2 bg-white/20 group-hover:bg-primary rounded-full transition-colors"></span>
                                    Member Login
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="w-full py-10 px-8 md:px-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-end text-white/20 text-[10px] uppercase tracking-[0.2em]">
                <div className="mb-4 md:mb-0">
                    Ethereal Techno<br />
                    Curated Culture
                </div>
                <div className="text-right font-mono">
                    [ &copy; 2025 ]
                </div>
            </footer>
        </div>
    );
}

// --- Sub-Components ---

// 1. Masked Text Reveal
interface MaskedTextProps {
    text: string[];
    className: string;
}

const MaskedText: React.FC<MaskedTextProps> = ({ text, className }) => {
    return (
        <div className="flex flex-col items-start">
            {text.map((line, index) => (
                <div key={index} className="overflow-hidden relative">
                    <motion.h1
                        custom={index}
                        variants={textRevealVar}
                        initial="initial"
                        animate="enter"
                        className={className}
                    >
                        {line}
                    </motion.h1>
                </div>
            ))}
        </div>
    );
};

// 2. Manifesto Item - Tuned for Anton
interface ManifestoItemProps {
    title: string;
    subtitle: string;
    description: string;
}

const ManifestoItem: React.FC<ManifestoItemProps> = ({ title, subtitle, description }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="group flex flex-col gap-6 border-l-2 border-white/10 pl-8 md:pl-16 py-2 transition-all duration-500 hover:border-primary">
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                {title}
            </span>

            {/* Anton needs to be HUGE to look good. Using clamp or vw. */}
            <h3 className="font-main text-[6vw] md:text-[5vw] leading-[0.85] uppercase text-white transition-colors duration-500 group-hover:text-white">
                {subtitle}
            </h3>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-xl font-light">
                {description}
            </p>
        </div>
    );
};

// 3. Massive Interactive Link - Tuned for Anton
interface BigLinkProps {
    href: string;
    title: string;
    sub: string;
    router: ReturnType<typeof useRouter>;
}

const BigLink: React.FC<BigLinkProps> = ({ href, title, sub, router }) => {
    return (
        <motion.button
            onClick={() => router.push(href)}
            initial="initial"
            whileHover="hover"
            className="group relative w-full py-32 md:py-40 flex flex-col items-center justify-center overflow-hidden cursor-none-styles"
        >
            {/* Background Hover Fill */}
            <motion.div
                variants={{
                    initial: { scaleY: 0 },
                    hover: { scaleY: 1 }
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-primary origin-bottom -z-10"
            />

            <div className="relative z-10 flex flex-col items-center w-full">
                <span className="text-[10px] font-mono mb-6 opacity-60 group-hover:text-black group-hover:opacity-100 transition-colors tracking-[0.3em]">
                    {sub}
                </span>

                <div className="flex items-center justify-center gap-4 md:gap-8 w-full px-4">
                    {/* Using vw units specifically for Anton to force full width */}
                    <h2 className="font-main text-[13vw] leading-[0.75] uppercase text-white group-hover:text-black transition-colors duration-300 text-center whitespace-nowrap">
                        {title}
                    </h2>

                    <motion.div
                        variants={{
                            initial: { rotate: 45, color: "#ffffff" },
                            hover: { rotate: 0, color: "#000000" }
                        }}
                        transition={{ duration: 0.4 }}
                        className="hidden md:block"
                    >
                        <ArrowUpRight className="w-[8vw] h-[8vw] stroke-[1.5px]" />
                    </motion.div>
                </div>
            </div>
        </motion.button>
    );
};
