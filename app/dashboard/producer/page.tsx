"use client";

import { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/auth";
import { motion } from "framer-motion";
import Loading from "@/app/components/general/loading";
import NewsFeed from "./components/NewsFeed";
import ProducerList from "./components/ProducerList";
import { MessageCircle, Trophy, Shield, Unlock, ShoppingBag, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface ProducerData {
    id: string;
    username: string;
    name: string;
    artistName: string;
    artistPhoto: string | null;
}

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function ProducerOverviewPage() {
    const [producer, setProducer] = useState<ProducerData | null>(null);
    const [loading, setLoading] = useState(true);

    const [greeting, setGreeting] = useState("");
    const [telegramStatus, setTelegramStatus] = useState<"idle" | "connecting" | "connected">("idle");
    const [telegramLoading, setTelegramLoading] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Good Morning");
        else if (hour >= 12 && hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const profileRes = await authenticatedFetch("/api/producer/profile");
            if (profileRes.ok) {
                const data = await profileRes.json();
                setProducer(data.producer);
                if (data.producer.telegramUsername) {
                    setTelegramStatus("connected");
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleTelegramConnect = async () => {
        if (!producer) return;
        setTelegramLoading(true);
        try {
            const res = await fetch("/api/telegram/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: producer.id })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.deepLink) {
                    window.open(data.deepLink, "_blank");
                    setTelegramStatus("connecting");
                }
            }
        } catch (e) {
            console.error("Connect error", e);
        }
        setTelegramLoading(false);
    };

    const handleTelegramDisconnect = async () => {
        if (!producer) return;
        setTelegramLoading(true);
        try {
            await fetch("/api/telegram/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: producer.id })
            });
            setTelegramStatus("idle");
        } catch { }
        setTelegramLoading(false);
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-none space-y-12 pt-16"
        >
            {/* HERO SECTION */}
            <div className="flex flex-col gap-3">
                <h2 className="font-main text-6xl md:text-8xl uppercase text-white tracking-tight">
                    {greeting}, <span className="text-white/40">{producer?.artistName || producer?.name || "Producer"}</span>.
                </h2>
            </div>

            {/* News Feed */}
            <div className="w-full">
                <NewsFeed />
            </div>

            {/* Telegram and Contest Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Private Telegram */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-4 h-4 text-white/50" />
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/50">Private Telegram</h3>
                    </div>
                    <div className="flex-1 bg-zinc-900/40 border border-[#2AABEE]/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group hover:border-[#2AABEE]/40 transition-colors min-h-[340px] flex flex-col justify-between">
                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2AABEE]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="absolute -bottom-8 -right-8 opacity-20 group-hover:opacity-30 transition-opacity">
                            <MessageCircle className="w-48 h-48 text-[#2AABEE]" strokeWidth={1} />
                        </div>

                        <div className="relative z-10 space-y-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-[#2AABEE]/10 text-[#2AABEE] flex items-center justify-center border border-[#2AABEE]/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <MessageCircle className="w-5 h-5" />
                            </div>

                            <div>
                                <h4 className="text-3xl font-main uppercase text-white tracking-wide mb-1">
                                    {telegramStatus === "connected" ? "Access Granted" : "Private Circle"}
                                </h4>
                                <p className="text-[#2AABEE] text-sm">
                                    {telegramStatus === "connected"
                                        ? `You are connected securely as @${producer?.username || producer?.name || "producer"}. Welcome to the inner circle.`
                                        : "Connect your Telegram account to join the verified producer group chat."}
                                </p>
                            </div>

                            {telegramStatus === "connecting" ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2AABEE]/10 rounded-full text-[#2AABEE] text-xs font-mono mb-6 animate-pulse mt-4">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Waiting for bot...
                                </div>
                            ) : (
                                <p className="text-white/50 text-sm leading-relaxed max-w-[85%] mt-4">
                                    The official private Telegram space for verified Ethereal Techno producers. Connect with verified producers, receive updates first, and participate in private discussions and challenges.
                                </p>
                            )}
                        </div>

                        <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6 mt-auto">
                            {telegramStatus === "connected" ? (
                                <>
                                    <button onClick={() => window.open("https://t.me/etherealtechno", "_blank")} className="bg-[#2AABEE] hover:bg-[#2AABEE]/90 text-black text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(42,171,238,0.3)] whitespace-nowrap">
                                        Open Telegram
                                    </button>
                                    <button onClick={handleTelegramDisconnect} disabled={telegramLoading} className="bg-black/20 hover:bg-white/5 text-[#2AABEE] text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors border border-[#2AABEE]/30 whitespace-nowrap disabled:opacity-50">
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleTelegramConnect}
                                    disabled={telegramLoading || telegramStatus === "connecting"}
                                    className="bg-black/20 hover:bg-white/5 text-[#2AABEE] text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors border border-[#2AABEE]/30 whitespace-nowrap disabled:opacity-50"
                                >
                                    {telegramLoading ? "Connecting..." : "Connect Telegram"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Featured Contest */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-white/50" />
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/50">Featured Contest</h3>
                    </div>
                    <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group hover:bg-white/[0.02] transition-colors min-h-[340px] flex flex-col justify-between">
                        {/* Top gradient border effect */}
                        <div className="absolute top-0 left-0 w-[40%] h-[2px] bg-gradient-to-r from-yellow-500/50 via-yellow-500/20 to-transparent"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between">
                                <div className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border border-white/5">
                                    Event
                                </div>
                                <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                                    Ends in 3d
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 mt-auto">
                                <h4 className="text-4xl lg:text-5xl font-main uppercase text-white tracking-wide">Remix Contest</h4>
                                <p className="text-white/60 text-sm leading-relaxed max-w-[90%]">
                                    High-value remix contests and creative missions are announced exclusively inside the Circle.
                                    <br /><br />
                                    The first official contest is coming soon. Stay connected via Telegram.
                                </p>

                                <button className="flex items-center gap-2 text-white font-bold uppercase text-[10px] tracking-widest pt-4 group/btn hover:text-primary transition-colors">
                                    View Details
                                    <ArrowUpRight className="w-4 h-4 text-white/50 group-hover/btn:text-primary transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Circle Privileges */}
            <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-white/50" />
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/50">Circle Privileges</h3>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                    {/* Texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

                    <div className="relative z-10 pr-4">
                        <h4 className="text-[15px] text-white font-medium mb-10 opacity-90">
                            As a verified member, you receive:
                        </h4>

                        <div className="space-y-10">
                            <div className="flex gap-5">
                                <div className="mt-0.5 text-primary opacity-80">
                                    <Unlock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="text-white text-sm font-medium mb-1.5 opacity-90">Access to Circle Exclusives</h5>
                                    <p className="text-white/50 text-[13px] leading-relaxed">
                                        Small curated libraries available free as part of your membership.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="mt-0.5 text-primary opacity-80">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="text-white text-sm font-medium mb-1.5 opacity-90">20% Privilege on Libraries & Merch</h5>
                                    <p className="text-white/50 text-[13px] leading-relaxed">
                                        Automatically applied at checkout. Personal and non-transferable.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-12">
                            <Link href="/free/content">
                                <button className="bg-white hover:bg-neutral-200 text-black text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-full transition-colors shadow-lg shadow-white/5">
                                    Free Pack Zone
                                </button>
                            </Link>
                            <Link href="/libraries">
                                <button className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-full transition-colors border border-white/5">
                                    Library Shop
                                </button>
                            </Link>
                            <Link href="/merch">
                                <button className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-full transition-colors border border-white/5">
                                    Merch Shop
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verified Producers (Apple Music Style) */}
            <div className="w-full">
                <ProducerList />
            </div>
        </motion.div>
    );
}