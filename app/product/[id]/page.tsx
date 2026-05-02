"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, X, ShoppingCart, Play } from "lucide-react";
import { getFileName } from "@/app/services/getFileName";
import UrlAudioPlayer from "@/app/components/general/UrlAudioPlayer";

interface ProductData {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    price: number;
    artworkUrl: string | null;
    artworkKey: string | null;
    boxCoverUrl: string | null;
    boxCoverKey: string | null;
    demoAudioKeys: string[];
    demoAudioNames: string[];
    tags: string[];
    specs: string[];
    defaultFullLoopId: string | null;
    contents: { id: string; contentType: string; contentName: string; soundGroup?: string; subGroup?: string; file?: { awsKey: string }; metadata?: { key?: string; bpm?: string } }[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [demoUrls, setDemoUrls] = useState<{ key: string; url: string; name: string }[]>([]);
    const [artworkSignedUrl, setArtworkSignedUrl] = useState<string | null>(null);
    const [boxCoverSignedUrl, setBoxCoverSignedUrl] = useState<string | null>(null);
    const [trackUrls, setTrackUrls] = useState<Record<string, string>>({});
    const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);

    const getPresignedUrl = async (key: string): Promise<string | null> => {
        try {
            const res = await fetch(`/api/content/stream?key=${encodeURIComponent(key)}`);
            if (res.ok) { const { url } = await res.json(); return url; }
        } catch { }
        return null;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { id } = await params;
                const response = await fetch(`/api/sounds/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);

                    if (data.artworkKey) {
                        const url = await getPresignedUrl(data.artworkKey);
                        if (url) setArtworkSignedUrl(url);
                    }

                    if (data.boxCoverKey) {
                        const url = await getPresignedUrl(data.boxCoverKey);
                        if (url) setBoxCoverSignedUrl(url);
                    }

                    if (data.demoAudioKeys?.length > 0) {
                        const demos: { key: string; url: string; name: string }[] = [];
                        for (let i = 0; i < data.demoAudioKeys.length; i++) {
                            const url = await getPresignedUrl(data.demoAudioKeys[i]);
                            if (url) demos.push({ key: data.demoAudioKeys[i], url, name: data.demoAudioNames?.[i] || `Demo ${i + 1}` });
                        }
                        setDemoUrls(demos);
                    }

                    const soundsRes = await fetch('/api/sounds');
                    if (soundsRes.ok) {
                        const soundsData = await soundsRes.json();
                        setRelatedProducts((soundsData.products || []).filter((p: ProductData) => p.id !== data.id).slice(0, 4));
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params]);

    const handleTrackPlay = async (track: ProductData["contents"][number]) => {
        if (playingId === track.id) { setPlayingId(null); return; }
        if (!trackUrls[track.id] && track.file?.awsKey) {
            const url = await getPresignedUrl(track.file.awsKey);
            if (url) setTrackUrls(prev => ({ ...prev, [track.id]: url }));
        }
        setPlayingId(track.id);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
                <h1 className="text-3xl font-semibold mb-4">Product Not Found</h1>
                <Link href="/sounds" className="text-yellow-500 hover:underline text-sm">Back to Sounds</Link>
            </div>
        );
    }

    const tabs = ["ALL", "LOOPS", "LOOPS+MIDI", "PRESETS"];
    const filteredTracks = activeTab === "ALL"
        ? product.contents
        : product.contents.filter(c => {
            if (activeTab === "LOOPS") return c.contentType?.toLowerCase().includes("loop");
            if (activeTab === "LOOPS+MIDI") return c.contentType?.toLowerCase().includes("midi");
            if (activeTab === "PRESETS") return c.contentType?.toLowerCase().includes("preset");
            return true;
        });

    const boxImage = boxCoverSignedUrl || artworkSignedUrl || product.boxCoverUrl || product.artworkUrl;

    return (
        <div className="min-h-screen bg-black text-white">

            {/* ═══════════ TOP BAR ═══════════ */}
            <header className="sticky top-0 z-50 bg-black border-b border-neutral-900">
                <div className="flex items-center justify-between px-6 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-500 text-black font-bold text-[10px] flex items-center justify-center rounded-sm">ET</div>
                        <span className="text-xs tracking-[0.2em] font-medium">ETHEREAL TECHNO</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="text-neutral-400 hover:text-white transition">
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                        <Link href="/sounds" className="text-neutral-400 hover:text-white transition">
                            <X className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* ═══════════ 1. HERO PRODUCT SECTION (light gradient bg) ═══════════ */}
            <section className="relative overflow-hidden" style={{
                background: "radial-gradient(ellipse at center, #b8bdc0 0%, #7a7e82 40%, #2a2d30 80%, #0a0a0a 100%)"
            }}>
                <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 items-center">

                    {/* LEFT: Product Box */}
                    <div className="flex items-center justify-center lg:justify-start">
                        <div className="relative w-[340px] h-[440px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
                            {boxImage ? (
                                <Image src={boxImage} alt={product.title} fill className="object-contain" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black flex flex-col items-center justify-center">
                                    <h2 className="font-bold text-4xl uppercase text-center leading-tight text-white">ETHEREAL<br />TECHNO</h2>
                                    <p className="text-yellow-500 text-[10px] tracking-[0.3em] uppercase mt-4">Pulse Architect</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col max-w-[460px]">
                        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                            {product.title}
                        </h1>
                        <p className="text-neutral-300 text-sm mb-5">
                            {product.subtitle || "The best sample of drums and pads all together in a crazy sample library"}
                        </p>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(product.tags.length > 0 ? product.tags : ["12 KITS", "2.4 GB", "WAV + MIDI"]).map((tag, i) => (
                                <span key={i} className="bg-black/40 border border-neutral-600 text-neutral-200 text-[11px] px-3 py-1 tracking-wider uppercase">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Price */}
                        <p className="text-xl text-white font-semibold mb-6">
                            € {product.price.toFixed(2).replace('.', ',')}
                        </p>

                        {/* CTA Button */}
                        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold tracking-[0.2em] px-10 py-3 text-sm transition-colors w-fit">
                            ADD TO CART
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════ 2. AUDIO DEMO SECTION ═══════════ */}
            {demoUrls.length > 0 && (
                <section className="py-16 px-6 bg-black">
                    <div className="max-w-[900px] mx-auto">
                        <h2 className="text-center text-yellow-500 text-xs tracking-[0.3em] uppercase font-medium mb-10">
                            LISTEN TO THE DEMOS
                        </h2>
                        <div className="space-y-5">
                            {demoUrls.map((demo) => (
                                <UrlAudioPlayer
                                    key={demo.key}
                                    url={demo.url}
                                    label={demo.name || "Demos of Included Vocal Samples"}
                                    variant="demo"
                                    isActive={playingId === `demo-${demo.key}`}
                                    onPlayStateChange={(playing) =>
                                        setPlayingId(playing ? `demo-${demo.key}` : null)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════ 3. ABOUT SECTION ═══════════ */}
            <section className="py-16 px-6 bg-black">
                <div className="max-w-[900px] mx-auto text-center">
                    <h3 className="text-xs text-yellow-500 tracking-[0.3em] uppercase font-medium mb-6">About This Library</h3>
                    <p className="text-neutral-300 text-[13px] leading-relaxed">
                        {product.description || "A carefully curated collection of sounds designed for professional music production. Each sample has been meticulously crafted and processed to deliver the highest audio quality."}
                    </p>
                </div>
            </section>

            {/* ═══════════ 4. SAMPLE LIST + SPECS (two-column) ═══════════ */}
            <section className="py-8 px-6 bg-black">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12">

                    {/* LEFT: Sample Table */}
                    <div>
                        {/* Tabs */}
                        <div className="flex gap-8 mb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-2 text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === tab
                                            ? "text-yellow-500"
                                            : "text-neutral-500 hover:text-neutral-300"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-[40px_minmax(0,1.5fr)_minmax(0,1fr)_50px_50px_50px] gap-3 px-2 py-2 text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                            <div>Pack</div>
                            <div>Filename ↕</div>
                            <div></div>
                            <div className="text-center">Time ↕</div>
                            <div className="text-center">Key ↕</div>
                            <div className="text-center">BPM ↕</div>
                        </div>

                        {/* Track Rows */}
                        <div>
                            {filteredTracks.length === 0 ? (
                                <div className="py-16 text-center">
                                    <p className="text-neutral-600 text-xs uppercase tracking-widest">No tracks in this category</p>
                                </div>
                            ) : (
                                filteredTracks.map((track) => {
                                    const isActive = playingId === track.id;
                                    const fileName = getFileName({
                                        contentType: track.contentType,
                                        soundGroup: track.soundGroup || "Unknown",
                                        soundType: track.subGroup || "Unknown",
                                        tempo: track.metadata?.bpm ? Number(track.metadata.bpm) : undefined,
                                        key: track.metadata?.key,
                                        name: track.contentName || "Unknown"
                                    });
                                    const tagList = [track.soundGroup, track.subGroup, track.contentType].filter(Boolean);
                                    const trackUrl = trackUrls[track.id];

                                    return (
                                        <div
                                            key={track.id}
                                            className={`grid grid-cols-[40px_minmax(0,1.5fr)_minmax(0,1fr)_50px_50px_50px] gap-3 px-2 py-2.5 items-center transition-all border-b border-neutral-900 ${isActive ? "bg-yellow-500/10 border-l-2 border-l-yellow-500" : "hover:bg-neutral-900/60"
                                                }`}
                                        >
                                            {/* Pack thumbnail */}
                                            <div
                                                onClick={() => handleTrackPlay(track)}
                                                className="relative w-8 h-8 shrink-0 cursor-pointer"
                                            >
                                                {boxImage ? (
                                                    <Image src={boxImage} alt="pack" fill className="object-cover rounded-sm" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-800 rounded-sm" />
                                                )}
                                            </div>

                                            {/* Filename + tags */}
                                            <div
                                                onClick={() => handleTrackPlay(track)}
                                                className="min-w-0 cursor-pointer"
                                            >
                                                <p className={`text-[11px] truncate ${isActive ? "text-yellow-500" : "text-neutral-300"}`}>
                                                    {fileName}
                                                </p>
                                                {tagList.length > 0 && (
                                                    <div className="flex gap-2 mt-0.5">
                                                        {tagList.slice(0, 4).map((t, i) => (
                                                            <span key={i} className="text-[9px] text-neutral-500 uppercase">{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Waveform player (loads on first play) */}
                                            <div className="min-w-0">
                                                {trackUrl ? (
                                                    <UrlAudioPlayer
                                                        url={trackUrl}
                                                        variant="row"
                                                        isActive={isActive}
                                                        onPlayStateChange={(playing) =>
                                                            setPlayingId(playing ? track.id : null)
                                                        }
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => handleTrackPlay(track)}
                                                        className="flex items-center gap-3 w-full"
                                                    >
                                                        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-400 hover:bg-neutral-700">
                                                            <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                                                        </span>
                                                        <span className="flex-1 h-[1px] bg-neutral-800" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Time */}
                                            <span className="text-[10px] text-neutral-500 text-center font-mono">--</span>

                                            {/* Key */}
                                            <span className="text-[10px] text-neutral-500 text-center font-mono">
                                                {track.metadata?.key || "--"}
                                            </span>

                                            {/* BPM */}
                                            <span className="text-[10px] text-neutral-500 text-center font-mono">
                                                {track.metadata?.bpm || "--"}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Specifications + Refund */}
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-xs text-yellow-500 tracking-[0.3em] uppercase font-medium mb-4">Library Specifications</h3>
                            <div className="space-y-4 text-[12px] text-neutral-300">
                                <div>
                                    <p className="font-medium text-neutral-200">Audio Files</p>
                                    <p className="text-neutral-400">44.1 kHz, 24-bit</p>
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-200">Software Requirements</p>
                                    <p className="text-neutral-400">No third-party software required. Compatible with any DAW.</p>
                                </div>
                                {product.specs.length > 0 && (
                                    <div>
                                        <p className="font-medium text-neutral-200 mb-1">Included</p>
                                        <ul className="space-y-1">
                                            {product.specs.map((spec, i) => (
                                                <li key={i} className="text-neutral-400 flex items-start gap-2">
                                                    <span className="text-yellow-500 mt-0.5">☑</span>
                                                    <span>{spec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <p className="text-neutral-400 pt-2">
                                    All samples are 100% royalty-free for both personal and professional use.
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs text-yellow-500 tracking-[0.3em] uppercase font-medium mb-4">Refund Policy</h3>
                            <p className="text-[12px] text-neutral-400 leading-relaxed">
                                All products are digital downloads. For this reason, refunds are not available once files have been downloaded or accessed. If you experience any technical issue, please <a href="mailto:contact@etherealtechno.com" className="text-yellow-500 hover:underline">contact us</a> and we will assist you as soon as possible.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ 5. YOU MAY ALSO LIKE ═══════════ */}
            {relatedProducts.length > 0 && (
                <section className="py-20 px-6 bg-black border-t border-neutral-900">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-center text-sm text-white tracking-[0.3em] uppercase font-medium mb-12">
                            YOU MAY ALSO LIKE
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {relatedProducts.map((p) => (
                                <Link href={`/product/${p.id}`} key={p.id} className="group">
                                    <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden mb-3 hover:scale-[1.03] transition-transform">
                                        {p.boxCoverUrl || p.artworkUrl ? (
                                            <Image src={(p.boxCoverUrl || p.artworkUrl)!} alt={p.title} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-neutral-700 text-xs uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[13px] text-neutral-300 group-hover:text-white transition-colors text-center">
                                        {p.title}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
