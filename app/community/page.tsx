"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    ArrowUpRight,
    Download,
    MessageCircle,
    Trophy,
    Quote,
    Lock,
    Radio,
    ArrowRight
} from "lucide-react";
import { getAuthUser, AuthUser } from "@/lib/auth";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// --- Types ---
interface NewsItem {
    id: string;
    title: string;
    createdAt: string;
    priority: number;
}

interface DashboardLinkProps {
    number: string;
    title: string;
    meta: string;
    onClick: () => void;
}

interface MinimalFeedItemProps {
    time: string;
    text: string;
    priority?: number;
}

interface MinimalProducerProps {
    name: string;
    role: string;
}

interface MinimalQuoteProps {
    quote: string;
    author: string;
}

interface BigLinkProps {
    href: string;
    title: string;
    sub: string;
    router: ReturnType<typeof useRouter>;
}

interface MaskedTextProps {
    lines: string[];
    className: string;
}

interface ParallaxTileProps {
    y: MotionValue<number>;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    index: string;
}

interface VerifiedDashboardProps {
    user: AuthUser | null;
    router: ReturnType<typeof useRouter>;
    news: NewsItem[];
}

const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
};

const textReveal = {
    hidden: { y: "100%" },
    visible: (i: number) => ({
        y: "0%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: i * 0.05 }
    })
};

export default function CommunityPage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [news, setNews] = useState<NewsItem[]>([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const authUser = getAuthUser();
        setUser(authUser);
        setIsVerified(authUser?.type === "ARTIST" || authUser?.type === "ADMIN");
        
        // Fetch live news
        fetchNews();
        setLoading(false);
    }, []);

    const fetchNews = async () => {
        try {
            const response = await fetch("/api/news");
            if (response.ok) {
                const data = await response.json();
                setNews(data.news || []);
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    if (loading) return <LoadingScreen />;

    if (isVerified) return <VerifiedDashboard user={user} router={router} news={news} />;

    return (
        <div ref={containerRef} className="bg-black min-h-screen text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans">
            <BackgroundEffects />
            <Navigation />

            <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20">
                <div className="w-full max-w-[90vw]">
                    <MaskedText
                        lines={["THE ETHEREAL", "TECHNO COMMUNITY"]}
                        className="font-main text-[14vw] leading-[0.9] uppercase text-white tracking-tight"
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-12 md:mt-16 flex flex-col items-start gap-6"
                    >
                        <div className="w-12 h-1 bg-primary" />
                        <p className="text-lg md:text-2xl text-white/60 font-light max-w-xl leading-relaxed">
                            A circle of producers <br />
                            <span className="text-white">shaping a deeper sound.</span>
                        </p>
                    </motion.div>
                </div>
                <ScrollIndicator />
            </section>

            <section className="relative py-40 px-6 md:px-12 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-10%" }}
                    className="max-w-4xl space-y-12"
                >
                    <motion.p variants={fadeInUp} className="text-3xl md:text-5xl font-light leading-tight text-white/90">
                        Ethereal Techno is more than a genre — it&apos;s a <span className="font-main uppercase text-primary">movement</span> built on emotion, sound design, and artistic depth.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="w-px h-24 bg-white/10 mx-auto" />
                    <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-white/50 leading-relaxed max-w-2xl mx-auto">
                        Our community unites verified producers who share this vision.
                        To maintain quality, access is reserved strictly for <span className="text-white underline decoration-primary/30 underline-offset-4">verified producers</span>.
                    </motion.p>
                </motion.div>
            </section>

            <FeaturesSection />

            <section className="relative py-40 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20 flex items-center gap-4">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <h2 className="font-main text-4xl uppercase text-white/40">Community Voices</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                        <MinimalQuote quote="Ethereal Techno is not sound — it's emotion in form." author="AEON" />
                        <MinimalQuote quote="The quality of feedback here is unmatched anywhere else." author="NOVA" />
                        <MinimalQuote quote="Finally, a space where the depth of the music matters first." author="KOLLEKTIV" />
                    </div>
                </div>
            </section>

            <section className="relative min-h-[80vh] flex items-center justify-center px-6">
                <div className="w-full text-center space-y-12">
                    <p className="text-xl text-white/50 font-light max-w-xl mx-auto">
                        If you create music that reflects this spirit, apply to join.
                    </p>
                    {user ? (
                        user.type === "USER" ? (
                            <BigLink href="/artist/apply" title="JOIN THE CIRCLE" sub="START APPLICATION" router={router} />
                        ) : (
                            <div className="opacity-50">
                                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                                <h2 className="font-main text-[5vw] uppercase">Pending Review</h2>
                            </div>
                        )
                    ) : (
                        <BigLink href="/signup" title="JOIN THE CIRCLE" sub="GET STARTED" router={router} />
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}

const VerifiedDashboard: React.FC<VerifiedDashboardProps> = ({ user, router, news }) => {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black relative">
            <BackgroundEffects />

            <nav className="fixed top-0 left-0 w-full px-8 py-8 flex justify-between items-start z-50 pointer-events-none mix-blend-difference">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                        Verified Session
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">LOGGED IN AS</div>
                    <div className="font-main text-xl uppercase leading-none">{user?.username || "Artist"}</div>
                </div>
            </nav>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-20 min-h-screen flex flex-col">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    <div className="lg:col-span-8 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="space-y-2"
                        >
                            <DashboardLink
                                number="01"
                                title="The Vault"
                                meta="Download Assets"
                                onClick={() => router.push("/free/content")}
                            />
                            <DashboardLink
                                number="02"
                                title="The Wire"
                                meta="Telegram Access"
                                onClick={() => window.open("https://t.me/etherealtechno", "_blank")}
                            />
                            <DashboardLink
                                number="03"
                                title="The Arena"
                                meta="Contests & Events"
                                onClick={() => { }}
                            />
                        </motion.div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-center lg:pt-12">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="space-y-16"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-2">
                                    <Radio className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Live Feed</span>
                                </div>
                                <div className="space-y-6">
                                    {news.length > 0 ? (
                                        news.slice(0, 3).map((item) => (
                                            <MinimalFeedItem 
                                                key={item.id}
                                                time={new Date(item.createdAt).toLocaleDateString()} 
                                                text={item.title}
                                                priority={item.priority}
                                            />
                                        ))
                                    ) : (
                                        <MinimalFeedItem time="Now" text="No recent updates." />
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-2">
                                    <Users className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Featured Producers</span>
                                </div>
                                <div className="space-y-4">
                                    <MinimalProducer name="Seismal D" role="Contributor" />
                                    <MinimalProducer name="Kollektiv" role="Label Artist" />
                                    <MinimalProducer name="Aeon" role="Verified" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </div>
    );
};


const DashboardLink: React.FC<DashboardLinkProps> = ({ number, title, meta, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative border-t border-white/10 py-10 md:py-14 cursor-pointer hover:border-primary transition-colors duration-500"
        >
            <div className="flex items-baseline justify-between relative z-10 transition-transform duration-500 group-hover:translate-x-4">
                <div className="flex items-baseline gap-4 md:gap-8">
                    <span className="font-mono text-xs md:text-sm text-primary/50 group-hover:text-primary transition-colors">
                        /{number}
                    </span>
                    <h2 className="font-main text-6xl md:text-8xl uppercase leading-[0.8] text-white group-hover:text-primary transition-colors duration-300">
                        {title}
                    </h2>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">
                        [{meta}]
                    </span>
                    <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                </div>
            </div>
        </div>
    );
};

const MinimalFeedItem: React.FC<MinimalFeedItemProps> = ({ time, text, priority = 0 }) => {
    const getPriorityColor = (priority: number): string => {
        switch (priority) {
            case 2: return "text-red-400";
            case 1: return "text-yellow-400";
            default: return "text-primary/60";
        }
    };

    return (
        <div className="group">
            <div className="flex items-baseline gap-4">
                <span className={`font-mono text-[10px] whitespace-nowrap ${getPriorityColor(priority)}`}>
                    {time}
                </span>
                <p className="text-sm font-light text-white/70 leading-relaxed group-hover:text-white transition-colors">
                    {text}
                </p>
            </div>
        </div>
    );
};

const MinimalProducer: React.FC<MinimalProducerProps> = ({ name, role }) => (
    <div className="flex justify-between items-baseline group cursor-default">
        <span className="font-bold text-lg uppercase text-white/80 group-hover:text-primary transition-colors">{name}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">{role}</span>
    </div>
);


const FeaturesSection: React.FC = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "center start"] });
    const yLeft = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const yMiddle = useTransform(scrollYProgress, [0, 1], [150, -150]);
    const yRight = useTransform(scrollYProgress, [0, 1], [300, -200]);

    return (
        <section ref={containerRef} className="relative py-32 px-6 md:px-12 min-h-[120vh] flex items-center">
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-24">
                    <span className="text-xs font-mono text-primary uppercase tracking-widest">02 // Inside The Circle</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    <ParallaxTile y={yLeft} icon={Download} title="Exclusive Free Packs" desc="Verified-only resources." index="01" />
                    <ParallaxTile y={yMiddle} icon={MessageCircle} title="Private Telegram" desc="Direct line to the core." index="02" />
                    <ParallaxTile y={yRight} icon={Trophy} title="Contests & Collabs" desc="Shape the future." index="03" />
                </div>
            </div>
        </section>
    );
};

const ParallaxTile: React.FC<ParallaxTileProps> = ({ y, icon: Icon, title, desc, index }) => (
    <motion.div style={{ y }} className="w-full">
        <div className="border-t border-white/20 pt-6 group hover:border-primary transition-colors duration-500 h-[300px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-primary">/{index}</span>
                <Icon className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
                <h3 className="font-main text-5xl uppercase text-white mb-4 leading-[0.9]">{title}</h3>
                <p className="text-white/50 text-sm font-light max-w-[200px]">{desc}</p>
            </div>
        </div>
    </motion.div>
);

const MinimalQuote: React.FC<MinimalQuoteProps> = ({ quote, author }) => (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="flex flex-col gap-6">
        <Quote className="w-6 h-6 text-primary/50" />
        <p className="text-xl md:text-2xl font-light leading-snug text-white/90">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-3 mt-auto pt-6 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-main text-xs">{author[0]}</div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">{author}</span>
        </div>
    </motion.div>
);

const BigLink: React.FC<BigLinkProps> = ({ href, title, sub, router }) => (
    <motion.button onClick={() => router.push(href)} whileHover="hover" initial="initial" className="group relative w-full py-32 md:py-40 border-y border-white/10 hover:border-primary/50 transition-colors overflow-hidden">
        <motion.div variants={{ initial: { scaleY: 0 }, hover: { scaleY: 1 } }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 bg-primary/10 origin-bottom -z-10" />
        <div className="flex flex-col items-center gap-6">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">{sub}</span>
            <div className="flex items-center gap-6 md:gap-12">
                <h2 className="font-main text-[10vw] leading-[0.9] uppercase text-white group-hover:text-primary transition-colors duration-300">{title}</h2>
                <ArrowUpRight className="w-12 h-12 md:w-24 md:h-24 text-white/30 group-hover:text-primary transition-colors duration-300" />
            </div>
        </div>
    </motion.button>
);

const MaskedText: React.FC<MaskedTextProps> = ({ lines, className }) => (
    <div className="flex flex-col items-start">
        {lines.map((line, i) => (
            <div key={i} className="overflow-hidden">
                <motion.h1 custom={i} variants={textReveal} initial="hidden" animate="visible" className={className}>{line}</motion.h1>
            </div>
        ))}
    </div>
);

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
            <span className="text-xs font-mono tracking-widest text-white/50">LOADING...</span>
        </div>
    </div>
);

const BackgroundEffects: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none z-[0]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] brightness-100 contrast-150"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[150px] opacity-20" />
    </div>
);

const Navigation: React.FC = () => (
    <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-50 mix-blend-difference">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">Community</span>
        </div>
        <div className="hidden md:block text-[10px] font-mono opacity-50 tracking-widest text-white">[ ETHEREAL // CIRCLE ]</div>
    </nav>
);

const Footer: React.FC = () => (
    <footer className="w-full py-10 px-8 md:px-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-end text-white/20 text-[10px] uppercase tracking-[0.2em]">
        <div className="mb-4 md:mb-0">Ethereal Techno<br />Community</div>
        <div className="text-right font-mono">&copy; 2025</div>
    </footer>
);

const ScrollIndicator: React.FC = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-4 mix-blend-difference">
        <span className="text-[9px] uppercase tracking-[0.2em] -rotate-90 origin-center translate-y-4 text-white">Scroll</span>
        <div className="w-px h-24 bg-white/10 overflow-hidden">
            <motion.div animate={{ y: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-full h-1/2 bg-primary" />
        </div>
    </motion.div>
);