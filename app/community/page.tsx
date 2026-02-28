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
    Lock
} from "lucide-react";
import { getAuthUser, AuthUser, authenticatedFetch, logout } from "@/lib/auth";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import RightSidebar from "@/app/components/RightSidebar";

// --- Types ---
interface NewsItem {
    id: string;
    title: string;
    createdAt: string;
    priority: number;
    content?: string;
}

interface ProducerData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    type: string;
    country: string | null;
    createdAt: string;
    approvedAt: string | null;
    telegramUsername?: string | null;
}

interface VerifiedDashboardProps {
    user: ProducerData | null;
    authUser: AuthUser | null;
    router: ReturnType<typeof useRouter>;
    news: NewsItem[];
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

// --- Animation Variants ---
const fadeVar = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
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
    const [producer, setProducer] = useState<ProducerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [news, setNews] = useState<NewsItem[]>([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const authUser = getAuthUser();
        setUser(authUser);
        const verified = authUser?.type === "ARTIST" || authUser?.type === "ADMIN";
        setIsVerified(verified);

        const init = async () => {
            if (verified) {
                try {
                    const profileRes = await authenticatedFetch("/api/producer/profile");
                    if (profileRes.ok) {
                        const data = await profileRes.json();
                        setProducer(data.producer);
                    }
                } catch (e) {
                    console.error("Failed to fetch profile for sidebar", e);
                }
            }
            await fetchNews();
            setLoading(false);
        };

        init();
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

    if (isVerified) return <VerifiedDashboard user={producer} authUser={user} router={router} news={news} />;

    return (
        <div ref={containerRef} className="bg-black min-h-screen text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans">
            <BackgroundEffects />
            <Navigation />

            <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-12 pt-16">
                <div className="w-full max-w-[90vw]">
                    <h1 className="font-main font-light text-[12vw] md:text-[12vw] leading-[0.9] uppercase text-white tracking-relaxed mb-4 md:mb-6">
                        THE ETHEREAL<br />TECHNO COMMUNITY
                    </h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="flex flex-col items-start"
                    >
                        <p className="text-xl md:text-3xl text-[#E8D124] font-main uppercase tracking-wide max-w-2xl leading-tight">
                            A circle of producers shaping a deeper sound.
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
                    <motion.p variants={fadeVar} className="text-3xl md:text-5xl font-light leading-tight text-white/90">
                        Ethereal Techno is more than a genre — it&apos;s a <span className="font-main uppercase text-primary">movement</span> built on emotion, sound design, and artistic depth.
                    </motion.p>
                    <motion.div variants={fadeVar} className="w-px h-24 bg-white/10 mx-auto" />
                    <motion.p variants={fadeVar} className="text-xl md:text-2xl text-white/50 leading-relaxed max-w-2xl mx-auto">
                        The <span className="text-white">Ethereal Techno Circle</span> is a curated space for verified producers who share this vision and contribute to its evolution. Access is reserved to preserve quality and authenticity.
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
                        If your music reflects the Ethereal Techno spirit, apply to join the Circle.
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

// --- Verified Dashboard (Minimal Apple Music Style) ---
const VerifiedDashboard: React.FC<VerifiedDashboardProps> = ({ user, authUser, router, news }) => {

    const handleNavigation = (id: string) => {
        if (id === "sounds") return router.push("/libraries");
        if (id === "bundles") return router.push("/bundles");
        if (id === "merch") return router.push("/merch");
        if (id === "free-content") return router.push("/free/content");

        switch (id) {
            case "free-content": router.push("/free/content"); break;
            case "overview": router.push("/dashboard/producer"); break;
            case "profile": router.push("/dashboard/producer/profile"); break;
            case "billing": router.push("/dashboard/producer/billing"); break;
            case "orders": router.push("/dashboard/producer/orders"); break;
            default: router.push("/dashboard/producer");
        }
    };

    const displayUser = user || (authUser ? {
        id: authUser.id,
        username: authUser.username,
        email: authUser.email,
        name: authUser.name || "Artist",
        surname: authUser.surname || "",
        type: authUser.type,
        country: null,
        createdAt: new Date().toISOString(),
        approvedAt: null
    } : null);

    if (!displayUser) return <LoadingScreen />;



    return (
        <div className="flex h-screen bg-background text-white font-sans selection:bg-primary/30 overflow-hidden relative">

            <div className="flex flex-col lg:flex-row-reverse w-full h-full relative z-10">

                <RightSidebar
                    user={displayUser}
                    activeTab="community"
                    onNavigate={handleNavigation}
                    onSignOut={() => logout().then(() => router.push("/signin"))}
                />

                <main className="flex-1 h-full overflow-y-auto no-scrollbar relative z-10 pt-20 pb-12 px-6 lg:px-12">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVar}
                        className="max-w-[1600px] mx-auto w-full space-y-12"
                    >
                        {/* Header */}
                        <header className="flex flex-col gap-2 mb-8">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">The Circle</span>
                            <h1 className="font-main text-5xl md:text-7xl uppercase text-white tracking-tight leading-[0.9]">
                                Community<br /><span className="text-white/30">Hub</span>
                            </h1>
                        </header>

                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* 1. Telegram Connect (Large Hero Card) */}
                            <div className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-[#2AABEE]/10 border border-[#2AABEE]/20 p-10 flex flex-col justify-between transition-all duration-500 min-h-[400px]">
                                <TelegramCardSection user={displayUser} authUser={authUser} />
                            </div>

                            {/* 2. Featured Events (Vertical Stack) */}
                            <div className="flex flex-col gap-6 h-full">
                                <div className="flex-1 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-10 flex flex-col relative overflow-hidden group hover:bg-zinc-900/80 transition-colors">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono uppercase">Event</span>
                                                <span className="text-[10px] font-mono text-white/40">Ends in 3d</span>
                                            </div>
                                            <h3 className="font-main text-3xl uppercase mb-2">Remix Contest</h3>
                                            <p className="text-white/50 text-sm">Download stems and submit your track.</p>
                                        </div>
                                        <button className="mt-8 self-start flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
                                            View Details <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 rounded-[2.5rem] bg-white/5 border border-white/5 p-10 flex flex-col justify-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Users className="w-6 h-6 text-white/50" />
                                        <span className="text-xl font-main uppercase">Members</span>
                                    </div>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                                                {["S", "K", "A", "N"][i - 1]}
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-black flex items-center justify-center text-[10px] text-primary">
                                            +42
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. News Feed (List Style) */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <h3 className="font-main text-2xl uppercase">Latest Updates</h3>
                                <button className="text-xs font-mono uppercase tracking-widest text-primary hover:text-white transition-colors">View All</button>
                            </div>

                            <div className="w-full bg-zinc-900/30 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-md">
                                {news.length > 0 ? (
                                    news.map((item, index) => (
                                        <div key={item.id} className={`group flex flex-col md:flex-row md:items-center gap-6 p-6 hover:bg-white/5 transition-colors cursor-default ${index !== news.length - 1 ? 'border-b border-white/5' : ''}`}>

                                            {/* Priority Indicator */}
                                            {/* <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                {item.priority > 0 ? <Zap className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                            </div> */}

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{item.title}</h4>
                                                    {item.priority > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                                </div>
                                                {item.content && <p className="text-white/40 text-sm line-clamp-1">{item.content}</p>}
                                            </div>

                                            <div className="text-xs font-mono text-white/30 uppercase tracking-wider">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-white/30 font-mono text-sm uppercase">No updates available.</div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </main>
            </div>
        </div>
    );
};

// --- Sub-Components (Telegram Logic Encapsulated) ---

const TelegramCardSection: React.FC<{ user: ProducerData | null, authUser: AuthUser | null }> = ({ user, authUser }) => {
    const [status, setStatus] = useState<"idle" | "connecting" | "connected">(() =>
        user?.telegramUsername ? "connected" : "idle"
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.telegramUsername) setStatus("connected");
    }, [user]);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const uid = user?.id || authUser?.id;
            const res = await fetch("/api/telegram/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: uid })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.deepLink) {
                    window.open(data.deepLink, "_blank");
                    setStatus("connecting");
                }
            }
        } catch (e) {
            console.error("Connect error", e);
        }
        setLoading(false);
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            const uid = user?.id || authUser?.id;
            await fetch("/api/telegram/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: uid })
            });
            setStatus("idle");
        } catch { }
    };

    const isConnected = status === "connected";

    return (
        <>
            <div className="relative z-10 max-w-xl">
                <div className="w-16 h-16 rounded-full bg-[#2AABEE]/20 flex items-center justify-center text-[#2AABEE] mb-8 group-hover:scale-110 transition-transform duration-500">
                    <MessageCircle className="w-8 h-8" />
                </div>

                <h3 className="font-main text-4xl uppercase mb-4 text-white">
                    {isConnected ? "Access Granted" : "Private Circle"}
                </h3>

                <p className="text-[#2AABEE]/80 text-lg leading-relaxed mb-6">
                    {isConnected
                        ? `You are connected securely as @${user?.telegramUsername}. Welcome to the inner circle.`
                        : "Connect your Telegram account to join the verified producer group chat."
                    }
                </p>

                {status === "connecting" && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2AABEE]/10 rounded-full text-[#2AABEE] text-xs font-mono mb-6 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Waiting for bot...
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-auto">
                {isConnected ? (
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.open("https://t.me/etherealtechno", "_blank")} className="px-8 py-4 bg-[#2AABEE] text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
                            Open Telegram
                        </button>
                        <button onClick={handleDisconnect} disabled={loading} className="px-6 py-4 bg-[#2AABEE]/10 text-[#2AABEE] border border-[#2AABEE]/20 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#2AABEE]/20 transition-colors">
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={loading || status === "connecting"}
                        className="inline-flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-white/60 group-hover:text-white transition-colors hover:translate-x-2 duration-300"
                    >
                        {loading ? "Processing..." : "Initiate Connection"} <span className="text-[#2AABEE]">-&gt;</span>
                    </button>
                )}
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2AABEE]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageCircle className="w-[300px] h-[300px]" />
            </div>
        </>
    );
};

// --- Utils ---
const Loader2: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
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

const ScrollIndicator: React.FC = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-4 mix-blend-difference">
        <span className="text-[9px] uppercase tracking-[0.2em] -rotate-90 origin-center translate-y-4 text-white">Scroll</span>
        <div className="w-px h-24 bg-white/10 overflow-hidden">
            <motion.div animate={{ y: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-full h-1/2 bg-primary" />
        </div>
    </motion.div>
);

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
                    <span className="text-xs font-mono text-primary uppercase tracking-widest">02 // INSIDE THE ETHEREAL TECHNO CIRCLE</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    <ParallaxTile y={yLeft} icon={Download} title="EXCLUSIVE FREE PACKS" desc="Curated sounds reserved for verified members." index="01" />
                    <ParallaxTile y={yMiddle} icon={MessageCircle} title="PRIVATE TELEGRAM" desc="A private space for dialogue, feedback, and collaboration." index="02" />
                    <ParallaxTile y={yRight} icon={Trophy} title="CONTESTS & COLLABS" desc="Creative challenges that shape the evolution of Ethereal Techno." index="03" />
                </div>
            </div>
        </section>
    );
};

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
        <div className="text-right font-mono">&copy; {new Date().getFullYear()}</div>
    </footer>
);

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
            <span className="text-xs font-mono tracking-widest text-white/50">LOADING...</span>
        </div>
    </div>
);