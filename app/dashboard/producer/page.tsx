"use client";

import { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/auth";
import { motion } from "framer-motion";
import Loading from "@/app/components/general/loading";
import NewsFeed from "./components/NewsFeed";
import ProducerList from "./components/ProducerList";

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

    useEffect(() => {
        const fetchProfile = async () => {
            const profileRes = await authenticatedFetch("/api/producer/profile");
            if (profileRes.ok) {
                const data = await profileRes.json();
                setProducer(data.producer);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

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
            <div className="flex flex-col gap-2">
                <h2 className="font-main text-5xl md:text-7xl uppercase text-white tracking-tight">
                    Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"},<br />
                    <span className="text-white/40">{producer?.artistName || producer?.name || "Producer"}</span>.
                </h2>
            </div>

            {/* Verified Producers (Apple Music Style) */}
            <div className="w-full">
                <ProducerList />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* News Feed */}
                <div className="lg:col-span-3">
                    <NewsFeed />
                </div>
            </div>
        </motion.div>
    );
}