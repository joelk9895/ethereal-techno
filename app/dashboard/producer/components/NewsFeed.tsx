"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    priority: number;
}

export default function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch("/api/news");
                if (res.ok) {
                    const data = await res.json();
                    setNews(data.news);
                }
            } catch (e) {
                console.error("Failed to fetch news", e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <div className="animate-pulse h-64 w-full bg-white/5 rounded-[2.5rem]" />

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-white/40 uppercase tracking-widest text-sm font-mono">
                <Newspaper className="w-4 h-4" />
                <span>Community News</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {news.map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.id}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <h4 className="font-main text-xl mb-2 text-white">{item.title}</h4>
                        <p className="text-white/60 leading-relaxed font-light text-sm">{item.content}</p>
                        <div className="mt-4 text-xs font-mono text-white/20 uppercase">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                    </motion.div>
                ))}
                {news.length === 0 && (
                    <div className="text-white/30 text-center py-12 font-mono uppercase">
                        No news updates available.
                    </div>
                )}
            </div>
        </div>
    )
}
