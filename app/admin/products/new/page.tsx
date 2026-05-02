"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, 
    Upload, 
    Plus, 
    Trash2, 
    ArrowLeft, 
    Music, 
    Image as ImageIcon,
    Settings,
    FileAudio,
    Folder,
    FolderOpen,
    File as FileIcon,
    X,
    Loader2,
    CheckSquare,
    Square,
    Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authenticatedFetch } from "@/lib/auth";
import { getFileName } from "@/app/services/getFileName";

// --- Types ---
interface ContentItem {
    id: string;
    contentType: string;
    contentName: string;
    kitName?: string;
    soundGroup: string;
    subGroup: string | null;
    file?: { fileName: string, awsKey: string };
    metadata?: Record<string, string | undefined>;
}

interface TreeNode {
    name: string;
    path: string;
    type: 'folder' | 'file';
    children?: Record<string, TreeNode>;
    content?: ContentItem;
}

export default function NewProductAdminPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [price, setPrice] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [aboutText, setAboutText] = useState("");
    const [artworkUrl, setArtworkUrl] = useState("");
    const [artworkKey, setArtworkKey] = useState("");
    const [boxCoverUrl, setBoxCoverUrl] = useState("");
    const [boxCoverKey, setBoxCoverKey] = useState("");
    const [demoAudios, setDemoAudios] = useState<{ url: string; key: string; name: string }[]>([]);

    // Upload states
    const [uploadingArtwork, setUploadingArtwork] = useState(false);
    const [uploadingBoxCover, setUploadingBoxCover] = useState(false);
    const [uploadingDemo, setUploadingDemo] = useState(false);
    
    // Essential Element
    const [isEssential, setIsEssential] = useState(false);

    // File upload helper
    const uploadFile = async (file: File, prefix: string): Promise<{ url: string; key: string }> => {
        const res = await authenticatedFetch("/api/import/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: `${prefix}/${file.name}`, fileType: file.type })
        });
        const { uploadUrl, key } = await res.json();
        await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file
        });
        // Construct the public URL
        const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
        return { url: publicUrl, key };
    };

    // Specifications
    const [specs, setSpecs] = useState<string[]>([]);
    const [specInput, setSpecInput] = useState("");

    // Tracks in Product
    const [tracks, setTracks] = useState<ContentItem[]>([]);
    const [defaultFullLoopId, setDefaultFullLoopId] = useState<string | null>(null);

    // Modal State
    const [showContentModal, setShowContentModal] = useState(false);

    const handleSave = async () => {
        console.log("handleSave called", { title, price, tracks: tracks.length, defaultFullLoopId });
        if (!title || !price) {
            alert("Please provide a title and price.");
            return;
        }

        setSaving(true);
        try {
            const response = await authenticatedFetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    subtitle,
                    price,
                    description: aboutText,
                    tags,
                    specs,
                    tracks: tracks.map(t => t.id),
                    defaultFullLoopId,
                    artworkUrl,
                    artworkKey,
                    boxCoverUrl,
                    boxCoverKey,
                    demoAudioUrls: demoAudios.map(d => d.url),
                    demoAudioKeys: demoAudios.map(d => d.key),
                    demoAudioNames: demoAudios.map(d => d.name),
                    isEssential
                })
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/product/${data.id}`);
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };
    const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));
    
    const addSpec = () => {
        if (specInput.trim() && !specs.includes(specInput.trim())) {
            setSpecs([...specs, specInput.trim()]);
            setSpecInput("");
        }
    };
    const removeSpec = (s: string) => setSpecs(specs.filter(spec => spec !== s));

    const removeTrack = (id: string) => {
        setTracks(tracks.filter(t => t.id !== id));
        if (defaultFullLoopId === id) setDefaultFullLoopId(null);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
            
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </Link>
                    <div>
                        <h1 className="font-main text-3xl uppercase tracking-wide">Create Product</h1>
                        <p className="text-xs font-mono text-white/50 uppercase tracking-widest mt-1">Product Maker</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#E8D124] text-black hover:bg-[#E8D124]/90 px-8 py-3 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 rounded-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Product</>}
                </button>
            </div>

            <div className="max-w-[1200px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                
                {/* Main Content Form */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Basic Info */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
                        <h2 className="font-main text-2xl uppercase text-[#E8D124] flex items-center gap-3">
                            <Settings className="w-5 h-5" /> Basic Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Product Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E8D124] focus:outline-none transition-colors font-bold"
                                    placeholder="e.g. Aural Depth Volume 01"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Subtitle / Tagline</label>
                                <input 
                                    type="text" 
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white/70 focus:border-[#E8D124] focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Price (€)</label>
                                    <input 
                                        type="number" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E8D124] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Artwork URL (or upload below)</label>
                                    <input 
                                        type="text" 
                                        value={artworkUrl}
                                        onChange={(e) => setArtworkUrl(e.target.value)}
                                        placeholder="Direct image link"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E8D124] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {/* Artwork Upload */}
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Upload Artwork</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${artworkUrl ? 'border-[#E8D124]/50 bg-[#E8D124]/5' : 'border-white/10 hover:border-white/30 bg-black/30'}`}>
                                        {uploadingArtwork ? (
                                            <Loader2 className="w-5 h-5 text-[#E8D124] animate-spin" />
                                        ) : artworkUrl ? (
                                            <div className="text-center">
                                                <ImageIcon className="w-6 h-6 text-[#E8D124] mx-auto mb-1" />
                                                <span className="text-[9px] font-mono text-[#E8D124] uppercase">Uploaded ✓</span>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-5 h-5 text-white/30 mx-auto mb-1" />
                                                <span className="text-[9px] font-mono text-white/30 uppercase">Drop image</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setUploadingArtwork(true);
                                            try {
                                                const { url, key } = await uploadFile(file, "products/artwork");
                                                setArtworkUrl(url);
                                                setArtworkKey(key);
                                            } catch (err) { alert("Artwork upload failed"); }
                                            setUploadingArtwork(false);
                                        }} />
                                    </label>
                                </div>

                                {/* Box Cover Upload */}
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Upload Box Cover</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${boxCoverUrl ? 'border-[#E8D124]/50 bg-[#E8D124]/5' : 'border-white/10 hover:border-white/30 bg-black/30'}`}>
                                        {uploadingBoxCover ? (
                                            <Loader2 className="w-5 h-5 text-[#E8D124] animate-spin" />
                                        ) : boxCoverUrl ? (
                                            <div className="text-center">
                                                <ImageIcon className="w-6 h-6 text-[#E8D124] mx-auto mb-1" />
                                                <span className="text-[9px] font-mono text-[#E8D124] uppercase">Uploaded ✓</span>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-5 h-5 text-white/30 mx-auto mb-1" />
                                                <span className="text-[9px] font-mono text-white/30 uppercase">Drop image</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setUploadingBoxCover(true);
                                            try {
                                                const { url, key } = await uploadFile(file, "products/boxcover");
                                                setBoxCoverUrl(url);
                                                setBoxCoverKey(key);
                                            } catch (err) { alert("Box cover upload failed"); }
                                            setUploadingBoxCover(false);
                                        }} />
                                    </label>
                                </div>

                                {/* Demo Audio Upload (Multiple) */}
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Upload Demo Audios</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${demoAudios.length > 0 ? 'border-[#E8D124]/50 bg-[#E8D124]/5' : 'border-white/10 hover:border-white/30 bg-black/30'}`}>
                                        {uploadingDemo ? (
                                            <Loader2 className="w-5 h-5 text-[#E8D124] animate-spin" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-5 h-5 text-white/30 mx-auto mb-1" />
                                                <span className="text-[9px] font-mono text-white/30 uppercase">{demoAudios.length > 0 ? `${demoAudios.length} uploaded — add more` : 'Drop audio files'}</span>
                                            </div>
                                        )}
                                        <input type="file" accept="audio/*" multiple className="hidden" onChange={async (e) => {
                                            const files = e.target.files;
                                            if (!files || files.length === 0) return;
                                            setUploadingDemo(true);
                                            try {
                                                const newDemos = [...demoAudios];
                                                for (const file of Array.from(files)) {
                                                    const { url, key } = await uploadFile(file, "products/demo");
                                                    newDemos.push({ url, key, name: file.name.replace(/\.[^.]+$/, '') });
                                                }
                                                setDemoAudios(newDemos);
                                            } catch (err) { alert("Demo audio upload failed"); }
                                            setUploadingDemo(false);
                                        }} />
                                    </label>
                                    {demoAudios.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {demoAudios.map((demo, i) => (
                                                <div key={i} className="flex items-center justify-between bg-black/30 border border-white/5 rounded px-3 py-2">
                                                    <span className="text-[10px] font-mono text-white/60 truncate">{demo.name}</span>
                                                    <button onClick={() => setDemoAudios(demoAudios.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400 ml-2">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Essential Element Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={isEssential}
                                    onChange={(e) => setIsEssential(e.target.checked)}
                                    className="w-4 h-4 accent-[#E8D124] bg-black/50 border border-white/10 rounded"
                                />
                                <span className="text-[10px] font-mono uppercase text-white/50 tracking-widest">Essential Element</span>
                            </label>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Highlight Tags</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[#E8D124]/10 border border-[#E8D124]/20 rounded-full text-[10px] text-[#E8D124] font-mono flex items-center gap-2">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#E8D124] focus:outline-none"
                                    placeholder="Add a tag (e.g. 2.4 GB)"
                                />
                                <button onClick={addTag} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Add</button>
                            </div>
                        </div>

                        {/* About Text */}
                        <div>
                            <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">About the Library</label>
                            <textarea 
                                value={aboutText}
                                onChange={(e) => setAboutText(e.target.value)}
                                rows={5}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white/80 focus:border-[#E8D124] focus:outline-none transition-colors resize-y text-sm"
                            />
                        </div>
                    </section>

                    {/* Library Tracks */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-main text-2xl uppercase text-[#E8D124] flex items-center gap-3">
                                    <FileAudio className="w-5 h-5" /> Library Tracks
                                </h2>
                                <p className="text-[10px] font-mono text-white/30 uppercase mt-1">Select one track as the Default Full Loop (★)</p>
                            </div>
                            <button 
                                onClick={() => setShowContentModal(true)}
                                className="flex items-center gap-2 text-xs font-bold uppercase bg-[#E8D124] text-black hover:bg-white px-5 py-2.5 rounded-lg transition-all shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> Add Content
                            </button>
                        </div>
                        
                        <div className="bg-black/50 border border-white/10 rounded-lg overflow-hidden min-h-[200px]">
                            <div className="grid grid-cols-[30px_1fr_auto_auto_auto_auto_auto] gap-4 p-4 border-b border-white/10 text-[10px] font-mono uppercase text-white/50 tracking-widest bg-black/40">
                                <div className="text-center">★</div>
                                <div>File Name</div>
                                <div className="w-24 text-center">Type</div>
                                <div className="w-20 text-center">Group</div>
                                <div className="w-12 text-center">Key</div>
                                <div className="w-12 text-center">BPM</div>
                                <div className="w-8"></div>
                            </div>
                            
                            <div className="divide-y divide-white/5">
                                {tracks.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <FolderOpen className="w-12 h-12 text-white/10 mb-4" />
                                        <p className="text-white/40 text-sm font-mono uppercase tracking-widest">No tracks added yet</p>
                                        <p className="text-white/20 text-xs mt-2">Click &quot;Add Content&quot; to browse imported files.</p>
                                    </div>
                                ) : (
                                    tracks.map((track, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={`${track.id}-${idx}`} 
                                            className={`grid grid-cols-[30px_1fr_auto_auto_auto_auto_auto] gap-4 p-4 items-center text-xs font-mono group hover:bg-white/5 transition-colors ${defaultFullLoopId === track.id ? 'bg-[#E8D124]/5' : ''}`}
                                        >
                                            <button 
                                                onClick={() => setDefaultFullLoopId(track.id)}
                                                className={`flex items-center justify-center transition-colors ${defaultFullLoopId === track.id ? 'text-[#E8D124]' : 'text-white/10 hover:text-[#E8D124]/50'}`}
                                            >
                                                <Star className={`w-4 h-4 ${defaultFullLoopId === track.id ? 'fill-[#E8D124]' : ''}`} />
                                            </button>
                                            <div className="truncate text-white/90 font-bold">
                                                {getFileName({
                                                    contentType: track.contentType,
                                                    soundGroup: track.soundGroup || "Unknown",
                                                    soundType: track.subGroup || "Unknown",
                                                    tempo: track.metadata?.bpm ? Number(track.metadata.bpm) : undefined,
                                                    key: track.metadata?.key,
                                                    name: track.contentName || track.kitName || "Unknown"
                                                })}
                                            </div>
                                            <div className="w-24 text-center text-white/40">{track.contentType}</div>
                                            <div className="w-20 text-center text-white/40 truncate">{track.soundGroup}</div>
                                            <div className="w-12 text-center text-[#E8D124]">{track.metadata?.key || "-"}</div>
                                            <div className="w-12 text-center text-[#E8D124]">{track.metadata?.bpm || "-"}</div>
                                            <div className="w-8 text-right">
                                                <button onClick={() => removeTrack(track.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Setup */}
                <div className="space-y-10">
                    
                    {/* Media Upload */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
                        <h2 className="font-main text-2xl uppercase text-[#E8D124] flex items-center gap-3">
                            <ImageIcon className="w-5 h-5" /> Media
                        </h2>
                        
                        <div>
                            <label className="block text-[10px] font-mono uppercase text-white/50 mb-2 tracking-widest">Product Box Cover</label>
                            <div className="w-full aspect-[3/4] bg-black/50 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-[#E8D124]/50 hover:bg-[#E8D124]/5 transition-colors cursor-pointer group">
                                {artworkUrl ? (
                                    <div className="relative w-full h-full">
                                        <img src={artworkUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setArtworkUrl(""); }}
                                            className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E8D124]/20 transition-colors">
                                            <Upload className="w-6 h-6 text-white/40 group-hover:text-[#E8D124]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-white/80">Select Cover</p>
                                            <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">Paste URL in Basic Info</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Specifications */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
                        <h2 className="font-main text-2xl uppercase text-[#E8D124]">Specs List</h2>
                        
                        <div className="space-y-2">
                            <AnimatePresence>
                                {specs.map((spec) => (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        key={spec} 
                                        className="flex items-center justify-between bg-black/50 border border-white/10 p-3 rounded-lg overflow-hidden"
                                    >
                                        <span className="text-xs font-mono text-white/80">{spec}</span>
                                        <button onClick={() => removeSpec(spec)} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={specInput}
                                onChange={(e) => setSpecInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSpec()}
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#E8D124] focus:outline-none"
                                placeholder="Add spec..."
                            />
                            <button onClick={addSpec} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Add</button>
                        </div>
                    </section>

                </div>
            </div>

            {/* --- Content Selector Modal --- */}
            <AnimatePresence>
                {showContentModal && (
                    <ContentSelectorModal 
                        onClose={() => setShowContentModal(false)} 
                        onAdd={(selectedContent) => {
                            setTracks(prev => {
                                const existingIds = new Set(prev.map(t => t.id));
                                const newTracks = selectedContent.filter(c => !existingIds.has(c.id));
                                return [...prev, ...newTracks];
                            });
                            setShowContentModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Directory-like Content Selector Component ---
function ContentSelectorModal({ onClose, onAdd }: { onClose: () => void, onAdd: (content: ContentItem[]) => void }) {
    const [loading, setLoading] = useState(true);
    const [tree, setTree] = useState<TreeNode>({ name: 'Root', path: 'root', type: 'folder', children: {} });
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root', 'root/Construction Kits']));
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await authenticatedFetch("/api/admin/content");
                if (res.ok) {
                    const data = await res.json();
                    const newTree: TreeNode = { name: 'Root', path: 'root', type: 'folder', children: {} };
                    
                    data.contents?.forEach((item: ContentItem) => {
                        const typeFolder = item.contentType || 'Uncategorized';
                        const groupFolder = item.soundGroup || 'General';
                        const subFolder = item.subGroup;
                        const pType = `root/${typeFolder}`;
                        const pGroup = `${pType}/${groupFolder}`;
                        const pSub = subFolder ? `${pGroup}/${subFolder}` : pGroup;
                        const pFile = `${pSub}/${item.id}`;

                        if (!newTree.children![typeFolder]) newTree.children![typeFolder] = { name: typeFolder, path: pType, type: 'folder', children: {} };
                        if (!newTree.children![typeFolder].children![groupFolder]) newTree.children![typeFolder].children![groupFolder] = { name: groupFolder, path: pGroup, type: 'folder', children: {} };
                        let targetFolder = newTree.children![typeFolder].children![groupFolder];
                        if (subFolder) {
                            if (!targetFolder.children![subFolder]) targetFolder.children![subFolder] = { name: subFolder, path: pSub, type: 'folder', children: {} };
                            targetFolder = targetFolder.children![subFolder];
                        }
                        targetFolder.children![item.contentName] = { name: item.contentName, path: pFile, type: 'file', content: item };
                    });

                    if (data.kits && data.kits.length > 0) {
                        const kitTypeFolder = "Construction Kits";
                        const pKitType = `root/${kitTypeFolder}`;
                        if (!newTree.children![kitTypeFolder]) newTree.children![kitTypeFolder] = { name: kitTypeFolder, path: pKitType, type: 'folder', children: {} };
                        data.kits.forEach((kit: { id: string; kitName?: string; contents?: ContentItem[] }) => {
                            const kitName = kit.kitName || 'Unnamed Kit';
                            const pKit = `${pKitType}/${kit.id}`;
                            if (!newTree.children![kitTypeFolder].children![kitName]) newTree.children![kitTypeFolder].children![kitName] = { name: kitName, path: pKit, type: 'folder', children: {} };
                            const targetKitFolder = newTree.children![kitTypeFolder].children![kitName];
                            kit.contents?.forEach((item: ContentItem) => {
                                const pFile = `${pKit}/${item.id}`;
                                targetKitFolder.children![item.contentName] = { name: item.contentName, path: pFile, type: 'file', content: item };
                            });
                        });
                    }
                    setTree(newTree);
                }
            } catch (error) {
                console.error("Failed to load content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const toggleExpand = (path: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    const getAllFilePaths = (node: TreeNode): string[] => {
        if (node.type === 'file') return [node.path];
        let paths: string[] = [];
        if (node.children) {
            Object.values(node.children).forEach(child => {
                paths = [...paths, ...getAllFilePaths(child)];
            });
        }
        return paths;
    };

    const toggleSelection = (node: TreeNode, e: React.MouseEvent) => {
        e.stopPropagation();
        const allAssociatedPaths = getAllFilePaths(node);
        if (allAssociatedPaths.length === 0) return;
        const allSelected = allAssociatedPaths.every(p => selectedPaths.has(p));
        setSelectedPaths(prev => {
            const next = new Set(prev);
            if (allSelected) allAssociatedPaths.forEach(p => next.delete(p));
            else allAssociatedPaths.forEach(p => next.add(p));
            return next;
        });
    };

    const getSelectedContent = (node: TreeNode): ContentItem[] => {
        let content: ContentItem[] = [];
        if (node.type === 'file' && selectedPaths.has(node.path) && node.content) content.push(node.content);
        if (node.children) Object.values(node.children).forEach(child => { content = [...content, ...getSelectedContent(child)]; });
        return content;
    };

    const handleImport = () => onAdd(getSelectedContent(tree));

    const renderTree = (node: TreeNode, depth = 0): React.ReactNode => {
        if (node.name === 'Root') return Object.values(node.children || {}).map(child => renderTree(child, 0));
        const isExpanded = expandedPaths.has(node.path);
        const allChildPaths = getAllFilePaths(node);
        const selectedCount = allChildPaths.filter(p => selectedPaths.has(p)).length;
        const totalCount = allChildPaths.length;
        const isAllSelected = totalCount > 0 && selectedCount === totalCount;
        const isSomeSelected = selectedCount > 0 && selectedCount < totalCount;

        return (
            <div key={node.path} className="font-mono text-sm">
                <div 
                    className={`flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors ${node.type === 'file' ? 'text-white/80' : 'text-[#E8D124] font-bold'}`}
                    style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
                    onClick={() => node.type === 'folder' ? toggleExpand(node.path) : toggleSelection(node, { stopPropagation: () => {} } as React.MouseEvent)}
                >
                    <div className="p-1 cursor-pointer hover:text-[#E8D124] transition-colors flex-shrink-0" onClick={(e) => toggleSelection(node, e)}>
                        {isAllSelected ? <CheckSquare className="w-4 h-4 text-[#E8D124]" /> : 
                         isSomeSelected ? <div className="w-4 h-4 rounded-sm border border-white/50 bg-white/20 flex items-center justify-center"><div className="w-2 h-0.5 bg-white"></div></div> :
                         <Square className="w-4 h-4 text-white/30" />}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {node.type === 'folder' ? (isExpanded ? <FolderOpen className="w-4 h-4 text-[#E8D124]" /> : <Folder className="w-4 h-4 text-[#E8D124]" />) : <FileIcon className="w-4 h-4 text-white/40" />}
                        <span className="truncate">{node.type === 'file' && node.content ? getFileName({
                            contentType: node.content.contentType,
                            soundGroup: node.content.soundGroup || "Unknown",
                            soundType: node.content.subGroup || "Unknown",
                            tempo: node.content.metadata?.bpm ? Number(node.content.metadata.bpm) : undefined,
                            key: node.content.metadata?.key,
                            name: node.content.contentName || node.content.kitName || "Unknown"
                        }) : node.name}</span>
                        {node.type === 'folder' && <span className="text-[10px] text-white/30 ml-2">({totalCount})</span>}
                    </div>
                </div>
                {node.type === 'folder' && isExpanded && node.children && <div className="mt-1">{Object.values(node.children).map(child => renderTree(child, depth + 1))}</div>}
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                        <h3 className="font-main text-2xl uppercase tracking-wider text-[#E8D124]">Import Content</h3>
                        <p className="text-xs font-mono text-white/50 mt-1">Select files from your imported library</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? <div className="h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#E8D124] animate-spin" /></div> : <div className="bg-black/50 border border-white/5 rounded-lg p-4 min-h-full">{renderTree(tree)}</div>}
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="font-mono text-sm text-white/60">Selected: <span className="text-[#E8D124] font-bold">{getSelectedContent(tree).length}</span> files</div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                        <button onClick={handleImport} className="bg-[#E8D124] text-black px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#E8D124]/90 transition-all shadow-lg">Import Selected</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
