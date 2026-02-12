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

    const [greeting, setGreeting] = useState("");

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
            <div className="flex flex-col gap-3">
                <h2 className="font-main text-6xl md:text-8xl uppercase text-white tracking-tight">
                    {greeting}, <span className="text-white/40">{producer?.artistName || producer?.name || "Producer"}</span>.
                </h2>
            </div>

            {/* News Feed */}
            <div className="w-full">
                <NewsFeed />
            </div>

            {/* Verified Producers (Apple Music Style) */}
            <div className="w-full">
                <ProducerList />
            </div>
        </motion.div>
    );
}