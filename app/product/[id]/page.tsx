"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, ShoppingCart, Loader2 } from "lucide-react";
import { getFileName } from "@/app/services/getFileName";

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
    contents: any[];
}

// --- Waveform Component ---
function Waveform({ audioUrl, label, isActive, onPlay, onPause }: {
    audioUrl: string | null;
    label: string;
    isActive: boolean;
    onPlay: () => void;
    onPause: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animFrameRef = useRef<number>(0);
    const [waveformData, setWaveformData] = useState<number[]>([]);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState("0:00");
    const [currentTime, setCurrentTime] = useState("0:00");

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!audioUrl) return;
        setIsLoading(true);

        const audio = new Audio(audioUrl);
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        audio.addEventListener('loadedmetadata', () => {
            setDuration(formatTime(audio.duration));
        });

        const audioContext = new AudioContext();
        fetch(audioUrl)
            .then(res => res.arrayBuffer())
            .then(buffer => audioContext.decodeAudioData(buffer))
            .then(audioBuffer => {
                const rawData = audioBuffer.getChannelData(0);
                const samples = 80;
                const blockSize = Math.floor(rawData.length / samples);
                const filteredData: number[] = [];
                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[i * blockSize + j]);
                    }
                    filteredData.push(sum / blockSize);
                }
                const maxVal = Math.max(...filteredData);
                setWaveformData(filteredData.map(v => v / maxVal));
                setIsLoading(false);
                audioContext.close();
            })
            .catch(() => {
                setWaveformData(Array.from({ length: 80 }, () => Math.random() * 0.7 + 0.3));
                setIsLoading(false);
            });

        return () => {
            audio.pause();
            audio.src = "";
            audioContext.close().catch(() => {});
        };
    }, [audioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;
        if (isActive) {
            audio.play().catch(() => {});
            const update = () => {
                if (audio.duration) {
                    setProgress(audio.currentTime / audio.duration);
                    setCurrentTime(formatTime(audio.currentTime));
                }
                animFrameRef.current = requestAnimationFrame(update);
            };
            update();
        } else {
            audio.pause();
            cancelAnimationFrame(animFrameRef.current);
        }
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isActive, audioUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || waveformData.length === 0) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const barWidth = width / waveformData.length;
        const barGap = 2;

        ctx.clearRect(0, 0, width, height);
        waveformData.forEach((value, index) => {
            const barHeight = value * height * 0.8;
            const x = index * barWidth;
            const y = (height - barHeight) / 2;
            const isPlayed = index / waveformData.length <= progress;
            ctx.fillStyle = isPlayed ? "#eab308" : "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(x, y, barWidth - barGap, barHeight);
        });
    }, [waveformData, progress]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        const audio = audioRef.current;
        if (!container || !audio || !audio.duration) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const position = Math.max(0, Math.min(1, x / rect.width));
        audio.currentTime = position * audio.duration;
        setProgress(position);
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm px-5 py-4 flex items-center gap-4">
            <button
                onClick={() => isActive ? onPause() : onPlay()}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isActive ? "bg-yellow-500 text-black" : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                }`}
            >
                {isActive ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
            </button>

            <div className="flex-1 min-w-0">
                {isLoading ? (
                    <div className="h-10 flex items-center"><Loader2 className="w-4 h-4 text-yellow-500 animate-spin" /></div>
                ) : (
                    <div ref={containerRef} className="h-10 cursor-pointer" onClick={handleClick}>
                        <canvas ref={canvasRef} className="w-full h-full" />
                    </div>
                )}
                <p className="text-[10px] text-gray-500 mt-1 truncate">{label}</p>
            </div>

            <div className="shrink-0 text-right">
                <span className="text-[10px] text-gray-500 font-mono">{currentTime} / {duration}</span>
            </div>
        </div>
    );
}

// --- Track Row Waveform (inline, smaller) ---
function TrackRowWaveform({ isActive }: { isActive: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [data] = useState<number[]>(() => Array.from({ length: 50 }, () => Math.random() * 0.6 + 0.2));

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const barWidth = width / data.length;

        ctx.clearRect(0, 0, width, height);
        data.forEach((value, index) => {
            const barHeight = value * height * 0.8;
            const x = index * barWidth;
            const y = (height - barHeight) / 2;
            ctx.fillStyle = isActive ? "#eab308" : "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }, [data, isActive]);

    return (
        <div ref={containerRef} className="w-32 h-6">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
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
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

    const getPresignedUrl = async (key: string): Promise<string | null> => {
        try {
            const res = await fetch(`/api/content/stream?key=${encodeURIComponent(key)}`);
            if (res.ok) { const { url } = await res.json(); return url; }
        } catch {}
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

                    // Artwork presigned URL
                    if (data.artworkKey) {
                        const url = await getPresignedUrl(data.artworkKey);
                        if (url) setArtworkSignedUrl(url);
                    }

                    // Box cover presigned URL
                    if (data.boxCoverKey) {
                        const url = await getPresignedUrl(data.boxCoverKey);
                        if (url) setBoxCoverSignedUrl(url);
                    }

                    // Demo audio presigned URLs
                    if (data.demoAudioKeys?.length > 0) {
                        const demos: { key: string; url: string; name: string }[] = [];
                        for (let i = 0; i < data.demoAudioKeys.length; i++) {
                            const url = await getPresignedUrl(data.demoAudioKeys[i]);
                            if (url) demos.push({ key: data.demoAudioKeys[i], url, name: data.demoAudioNames?.[i] || `Demo ${i + 1}` });
                        }
                        setDemoUrls(demos);
                    }

                    // Fetch related products
                    const soundsRes = await fetch('/api/sounds');
                    if (soundsRes.ok) {
                        const soundsData = await soundsRes.json();
                        setRelatedProducts((soundsData.products || []).filter((p: any) => p.id !== data.id).slice(0, 4));
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

    const handleTrackPlay = async (track: any) => {
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

    const tabs = ["ALL", ...Array.from(new Set(product.contents.map(c => c.contentType || "OTHER")))];
    const filteredTracks = activeTab === "ALL"
        ? product.contents
        : product.contents.filter(c => c.contentType === activeTab);

    const boxImage = boxCoverSignedUrl || artworkSignedUrl || product.boxCoverUrl || product.artworkUrl;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-neutral-950 text-white">

            {/* ═══════════ 1. HERO PRODUCT SECTION ═══════════ */}
            <section className="py-20 px-6">
                <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: Product Box */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-[380px] h-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                            {boxImage ? (
                                <Image src={boxImage} alt={product.title} fill className="object-contain" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex flex-col items-center justify-center rounded-sm">
                                    <h2 className="font-semibold text-4xl uppercase text-center leading-tight">ETHEREAL<br/>TECHNO</h2>
                                    <p className="text-yellow-500 text-[10px] tracking-[0.3em] uppercase mt-4">Sample Library Vol. 01</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-semibold text-white mb-3">
                            {product.title}
                        </h1>
                        <p className="text-gray-400 text-sm max-w-[400px] mb-5">
                            {product.subtitle || product.description || "Premium sound library crafted for modern electronic music production."}
                        </p>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.tags.map((tag, i) => (
                                <span key={i} className="bg-neutral-800 text-gray-300 text-xs px-3 py-1 rounded-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Price */}
                        <p className="text-lg text-white font-medium mb-6">
                            € {product.price.toFixed(2).replace('.', ',')}
                        </p>

                        {/* CTA Button */}
                        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold tracking-wide px-6 py-3 rounded-sm transition-colors w-fit flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            ADD TO CART
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════ 2. AUDIO DEMO SECTION ═══════════ */}
            {demoUrls.length > 0 && (
                <section className="py-16 px-6">
                    <div className="max-w-[1250px] mx-auto">
                        <h2 className="text-center text-yellow-500 text-xs tracking-[0.25em] uppercase font-medium mb-10">
                            LISTEN TO THE DEMOS
                        </h2>
                        <div className="space-y-4">
                            {demoUrls.map((demo) => (
                                <Waveform
                                    key={demo.key}
                                    audioUrl={demo.url}
                                    label={demo.name}
                                    isActive={playingId === `demo-${demo.key}`}
                                    onPlay={() => setPlayingId(`demo-${demo.key}`)}
                                    onPause={() => setPlayingId(null)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════ 3. ABOUT SECTION ═══════════ */}
            <section className="py-16 px-6 border-t border-neutral-900">
                <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16">
                    {/* LEFT: About text */}
                    <div>
                        <h3 className="text-xs text-gray-500 tracking-widest uppercase mb-4">About This Library</h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-[600px]">
                            {product.description || "A carefully curated collection of sounds designed for professional music production. Each sample has been meticulously crafted and processed to deliver the highest audio quality."}
                        </p>
                    </div>

                    {/* RIGHT: Specifications */}
                    <div>
                        <h3 className="text-xs text-yellow-500 tracking-widest uppercase mb-4">Library Specifications</h3>
                        <ul className="space-y-2">
                            {product.specs.map((spec, i) => (
                                <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                                    {spec}
                                </li>
                            ))}
                            <li className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                                100% Royalty Free
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ═══════════ 4. SAMPLE LIST TABLE ═══════════ */}
            {product.contents.length > 0 && (
                <section className="py-16 px-6 border-t border-neutral-900">
                    <div className="max-w-[1250px] mx-auto">
                        {/* Tabs */}
                        <div className="flex gap-6 mb-8 border-b border-neutral-900">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-xs uppercase tracking-wider transition-all border-b-2 ${
                                        activeTab === tab
                                            ? "text-yellow-500 border-yellow-500"
                                            : "text-gray-500 border-transparent hover:text-gray-300"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-[40px_1fr_130px_60px_60px_60px] gap-4 px-4 pb-3 text-[10px] text-gray-600 uppercase tracking-wider border-b border-neutral-900">
                            <div></div>
                            <div>Filename</div>
                            <div>Waveform</div>
                            <div className="text-center">Time</div>
                            <div className="text-center">Key</div>
                            <div className="text-center">BPM</div>
                        </div>

                        {/* Track Rows */}
                        <div>
                            {filteredTracks.map((track) => {
                                const isActive = playingId === track.id;
                                return (
                                    <div
                                        key={track.id}
                                        onClick={() => handleTrackPlay(track)}
                                        className={`grid grid-cols-[40px_1fr_130px_60px_60px_60px] gap-4 px-4 py-3 items-center cursor-pointer transition-all border-b border-neutral-900 ${
                                            isActive ? "bg-yellow-900/20 border-l-2 border-l-yellow-500" : "hover:bg-neutral-800"
                                        }`}
                                    >
                                        {/* Play */}
                                        <button className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                            isActive ? "bg-yellow-500 text-black" : "bg-neutral-800 text-gray-500"
                                        }`}>
                                            {isActive
                                                ? <Pause className="w-3 h-3" fill="currentColor" />
                                                : <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                                            }
                                        </button>

                                        {/* Filename */}
                                        <p className="text-xs text-gray-300 truncate">
                                            {getFileName({
                                                contentType: track.contentType,
                                                soundGroup: track.soundGroup || "Unknown",
                                                soundType: track.subGroup || "Unknown",
                                                tempo: track.metadata?.bpm ? Number(track.metadata.bpm) : undefined,
                                                key: track.metadata?.key,
                                                name: track.contentName || "Unknown"
                                            })}
                                        </p>

                                        {/* Waveform */}
                                        <TrackRowWaveform isActive={isActive} />

                                        {/* Time */}
                                        <span className="text-[10px] text-gray-500 text-center font-mono">-</span>

                                        {/* Key */}
                                        <span className="text-[10px] text-gray-500 text-center font-mono">{track.metadata?.key || "-"}</span>

                                        {/* BPM */}
                                        <span className="text-[10px] text-gray-500 text-center font-mono">{track.metadata?.bpm || "-"}</span>
                                    </div>
                                );
                            })}

                            {filteredTracks.length === 0 && (
                                <div className="py-16 text-center">
                                    <p className="text-gray-600 text-xs uppercase tracking-widest">No tracks in this category</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════ 5. YOU MAY ALSO LIKE ═══════════ */}
            {relatedProducts.length > 0 && (
                <section className="py-20 px-6 border-t border-neutral-900 bg-gradient-to-b from-neutral-900 to-black">
                    <div className="max-w-[1250px] mx-auto">
                        <h2 className="text-center text-xs text-gray-500 tracking-[0.25em] uppercase mb-12">
                            YOU MAY ALSO LIKE
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                            {relatedProducts.map((p) => (
                                <Link href={`/product/${p.id}`} key={p.id} className="group">
                                    <div className="relative aspect-square bg-neutral-900 rounded-sm overflow-hidden mb-3 hover:scale-[1.03] transition-transform">
                                        {p.artworkUrl ? (
                                            <Image src={p.artworkUrl} alt={p.title} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-700 text-xs uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">{p.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">€ {p.price?.toFixed(2).replace('.', ',')}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
