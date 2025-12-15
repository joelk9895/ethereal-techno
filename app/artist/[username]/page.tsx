import prisma from "@/app/lib/database";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    Instagram,
    Facebook,
    Youtube,
    Link,
    Disc,
    Music,
    Mic2,
    Award,
    Twitter
} from "lucide-react";
import Image from "next/image";

// Initialize Prisma (ideally this should be imported from a shared lib)


interface PageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            artistApplications: {
                where: { status: "APPROVED" },
                take: 1,
            },
        },
    });

    if (!user || user.type !== "ARTIST") {
        return {
            title: "Artist Not Found | Ethereal Techno",
        };
    }

    const artistData = user.artistApplications[0];
    const artistName = artistData?.artistName || user.name;

    return {
        title: `${artistName} | Ethereal Techno Artist`,
        description: `Official profile of ${artistName} on Ethereal Techno.`,
    };
}

export default async function ArtistProfilePage({ params }: PageProps) {
    const { username } = await params;

    // Fetch user and approved application
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            artistApplications: {
                where: { status: "APPROVED" },
                take: 1,
            },
        },
    });

    // 404 if not found or not an artist
    if (!user || user.type !== "ARTIST") {
        notFound();
    }

    const profile = user.artistApplications[0];

    // Fallback if somehow they are ARTIST type but have no application data (legacy or direct DB edit)
    const artistName = profile?.artistName || user.username;
    const bio = profile?.quote || "Verified Artist on Ethereal Techno.";
    const photoUrl = profile?.photoUrl;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans relative overflow-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen opacity-20"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-24 md:py-32 max-w-5xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-end gap-12 mb-24">

                    {/* Avatar Frame */}
                    <div className="relative group shrink-0">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-white/10 p-1 relative z-10 bg-black">
                            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 relative">
                                {photoUrl ? (
                                    <Image
                                        src={photoUrl}
                                        alt={artistName}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <Mic2 size={48} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Decorative Rings */}
                        <div className="absolute inset-0 rounded-full border border-white/5 scale-110 group-hover:scale-125 transition-transform duration-1000 ease-out z-0"></div>
                        <div className="absolute inset-0 rounded-full border border-white/5 scale-125 group-hover:scale-150 transition-transform duration-1000 ease-out delay-75 z-0"></div>
                    </div>

                    {/* Name & Badge */}
                    <div className="flex-1 space-y-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                                <Award size={12} /> Verified Artist
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-main uppercase leading-none tracking-tight">
                            {artistName}
                        </h1>

                        {/* Capability Tags */}
                        <div className="flex gap-4 pt-2">
                            {profile?.canCreateLoops && (
                                <span className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wide">
                                    <Disc size={14} /> Loops
                                </span>
                            )}
                            {profile?.canCreateSerum && (
                                <span className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wide">
                                    <Mic2 size={14} /> Serum
                                </span>
                            )}
                            {profile?.canCreateDiva && (
                                <span className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wide">
                                    <Music size={14} /> Diva
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-12 gap-16 border-t border-white/10 pt-16">

                    {/* Left Column: Bio & Info */}
                    <div className="md:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">Manifesto</h2>
                            <p className="text-2xl md:text-3xl font-light leading-relaxed text-white/90">
                                &ldquo;{bio}&rdquo;
                            </p>
                        </div>

                        {/* Stats / Details (Placeholder for future expansion) */}
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div>
                                <span className="block text-white/30 text-xs font-mono mb-2 uppercase">Joined</span>
                                <span className="text-xl font-light">{new Date(user.createdAt).getFullYear()}</span>
                            </div>
                            <div>
                                <span className="block text-white/30 text-xs font-mono mb-2 uppercase">Location</span>
                                <span className="text-xl font-light">{user.country || "Global"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Socials & Tracks */}
                    <div className="md:col-span-5 space-y-12">

                        {/* Social Links */}
                        <div className="space-y-6">
                            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">Connect</h2>
                            <div className="flex flex-wrap gap-4">
                                <SocialLink href={profile?.instagram} icon={Instagram} label="Instagram" />
                                <SocialLink href={profile?.tiktok} icon={Music} label="TikTok" /> {/* Using Music icon for TikTok as fallback */}
                                <SocialLink href={profile?.facebook} icon={Facebook} label="Facebook" />
                                <SocialLink href={profile?.youtube} icon={Youtube} label="YouTube" />
                                <SocialLink href={profile?.x} icon={Twitter} label="X" />
                                <SocialLink href={profile?.linktree} icon={Link} label="Linktree" />
                            </div>
                        </div>

                        {/* Top Tracks (If available) */}
                        {(profile?.track1 || profile?.track2 || profile?.track3) && (
                            <div className="space-y-6">
                                <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">Selected Works</h2>
                                <div className="space-y-3">
                                    {profile?.track1 && <TrackLink href={profile.track1} index={1} />}
                                    {profile?.track2 && <TrackLink href={profile.track2} index={2} />}
                                    {profile?.track3 && <TrackLink href={profile.track3} index={3} />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Subcomponents ---

function SocialLink({ href, icon: Icon, label }: { href?: string | null, icon: React.ComponentType<{ size?: number }>, label: string }) {
    if (!href) return null;

    // Ensure href is absolute
    const url = href.startsWith('http') ? href : `https://${href}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-black hover:bg-white hover:border-white transition-all duration-300 group"
            title={label}
        >
            <Icon size={18} />
        </a>
    );
}

function TrackLink({ href, index }: { href: string, index: number }) {
    // Ensure href is absolute
    const url = href.startsWith('http') ? href : `https://${href}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <div className="flex items-center gap-4 py-4 border-b border-white/5 group-hover:border-primary/50 transition-colors">
                <span className="font-mono text-xs text-white/30 group-hover:text-primary transition-colors">0{index}</span>
                <span className="text-lg font-light group-hover:translate-x-2 transition-transform duration-300">
                    Listen to Track
                </span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                    <Link size={14} className="text-primary" />
                </div>
            </div>
        </a>
    )
}
