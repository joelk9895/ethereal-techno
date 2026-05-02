"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, ArrowUpRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface SoundProduct {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    price: number;
    artworkUrl: string | null;
    tags: string[];
    specs: string[];
    defaultFullLoopId: string | null;
}

interface EssentialElement {
    id: string;
    title: string;
    subtitle: string | null;
    price: number;
    artworkUrl: string | null;
    tags: string[];
}

export default function SoundsPage() {
    const [products, setProducts] = useState<SoundProduct[]>([]);
    const [essentials, setEssentials] = useState<EssentialElement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/sounds");
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                    setEssentials(data.essentials || []);
                }
            } catch (error) {
                console.error("Error fetching sounds:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#E8D124] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#E8D124] selection:text-black">
            
            {/* Header Section */}
            <header className="pt-32 pb-20 text-center flex flex-col items-center">
                <h1 className="font-main text-6xl md:text-7xl uppercase tracking-tight mb-2">SOUNDS</h1>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">
                    Curated sound libraries shaped around the Ethereal Techno identity
                </p>
            </header>

            {/* Libraries Section */}
            <main className="max-w-[1500px] mx-auto px-10 pb-32">
                <div className="mb-10">
                    <h2 className="text-[#E8D124] font-mono text-[10px] uppercase tracking-[0.2em] mb-8">LIBRARIES</h2>
                    
                    {products.length === 0 ? (
                        <div className="py-20 text-center border border-white/5 rounded-lg">
                            <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">No libraries published yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                            {products.map((product) => (
                                <div key={product.id} className="group flex flex-col">
                                    {/* 3D Box / Artwork Container */}
                                    <Link href={`/product/${product.id}`} className="block relative aspect-[1/1.2] bg-[#0F0F0F] mb-6 overflow-hidden shadow-2xl">
                                        {product.artworkUrl ? (
                                            <Image 
                                                src={product.artworkUrl} 
                                                alt={product.title} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#1A1A1A] to-black">
                                                <h3 className="font-main text-5xl uppercase text-white mb-4 text-center leading-[0.85]">ETHEREAL<br/>TECHNO</h3>
                                                <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#E8D124]">PREMIUM PACK</p>
                                            </div>
                                        )}
                                        
                                        {/* Play Button Overlay */}
                                        <div className="absolute bottom-6 left-6 w-10 h-10 bg-[#E8D124] rounded-full flex items-center justify-center text-black shadow-xl hover:scale-110 transition-transform cursor-pointer">
                                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                                        </div>
                                    </Link>

                                    {/* Product Metadata Row 1: Title & Button */}
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-main text-lg uppercase tracking-wide leading-none pr-4">
                                            {product.title}
                                        </h3>
                                        <button className="bg-[#E8D124] text-black font-bold text-[9px] uppercase tracking-widest px-5 py-2.5 hover:bg-white transition-colors shrink-0">
                                            ADD TO CART
                                        </button>
                                    </div>

                                    {/* Product Metadata Row 2: Subtitle */}
                                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-4 line-clamp-1">
                                        {product.subtitle || "Exclusive sound design collection"}
                                    </p>

                                    {/* Product Metadata Row 3: Tags & Price */}
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3 text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                            {product.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="flex items-center gap-3">
                                                    {tag}
                                                    {i < 2 && i < product.tags.length - 1 && <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs font-mono text-white/80">€ {product.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Essential Elements Section */}
                <div className="mt-32">
                    <h2 className="text-[#E8D124] font-mono text-[10px] uppercase tracking-[0.2em] mb-8">ESSENTIAL ELEMENTS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {essentials.length > 0 ? essentials.map((item) => (
                            <Link href={`/product/${item.id}`} key={item.id} className="group">
                                <div className="aspect-square bg-[#0D0D0D] border border-white/5 flex items-center justify-center mb-4 group-hover:border-[#E8D124]/30 transition-all duration-500 overflow-hidden relative">
                                    {item.artworkUrl ? (
                                        <Image src={item.artworkUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/10 text-center whitespace-pre-line group-hover:text-white/30 transition-colors">
                                            {item.title.toUpperCase().split(' ').join('\n')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-between items-start px-1">
                                    <div>
                                        <h4 className="font-main text-xs uppercase tracking-widest group-hover:text-[#E8D124] transition-colors">{item.title}</h4>
                                        <p className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] mt-1">{item.subtitle || 'Essential Element'}</p>
                                    </div>
                                    <p className="text-[10px] font-mono text-white/20">€ {item.price.toFixed(2)}</p>
                                </div>
                            </Link>
                        )) : (
                            // Fallback mock items to match screenshot if DB is empty
                            ['KICK\nLAB', 'HI-HAT\nMINT', 'FX\nONE', 'VOX\nTEXTURE'].map((label, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="aspect-square bg-[#0D0D0D] border border-white/5 flex items-center justify-center mb-4 group-hover:border-[#E8D124]/30 transition-all duration-500">
                                        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/10 text-center whitespace-pre-line group-hover:text-white/30 transition-colors">
                                            {label}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-start px-1 opacity-50">
                                        <div>
                                            <h4 className="font-main text-xs uppercase tracking-widest">Product {i+1}</h4>
                                            <p className="text-[8px] font-mono text-white/30 uppercase mt-1">Essential Element</p>
                                        </div>
                                        <p className="text-[10px] font-mono text-white/20">€ 5</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Circle Text Banner */}
                <div className="mt-40 text-center max-w-xl mx-auto space-y-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 leading-loose">
                        Essential Elements are included in the Circle.<br/>
                        Verified producers can access these tools at no cost as part of their membership.
                    </p>
                    <Link href="/artist/apply" className="inline-block text-[10px] font-mono uppercase tracking-[0.3em] text-white border-b border-white/20 pb-1 hover:text-[#E8D124] hover:border-[#E8D124] transition-all">
                        Apply to join the Circle
                    </Link>
                </div>

                {/* Massive Join CTA */}
                <div className="mt-64 border-t border-white/5 pt-24 pb-12 flex justify-center">
                    <Link href="/artist/apply" className="group flex items-center gap-10 hover:opacity-80 transition-all">
                        <h2 className="font-main text-7xl md:text-9xl uppercase tracking-tighter text-[#E8D124]">
                            JOIN THE CIRCLE
                        </h2>
                        <ArrowUpRight className="w-16 h-16 md:w-24 md:h-24 text-[#E8D124] group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700" />
                    </Link>
                </div>
            </main>

            <style jsx global>{`
                .font-main { font-family: var(--font-anton), sans-serif; }
            `}</style>
        </div>
    );
}
