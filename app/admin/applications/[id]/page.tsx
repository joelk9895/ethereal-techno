"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    Check,
    X,
    User,
    Globe,
    Music,
    MessageSquare,
    Terminal,
    Save,
    ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { authenticatedFetch } from "@/lib/auth";

// --- Types ---
interface Application {
    id: string;
    artistName: string;
    email: string;
    photoUrl: string | null;
    photoKey: string | null;
    status: string;
    createdAt: string;
    reviewNotes: string | null;
    reviewedAt: string | null;
    reviewedBy: string | null;
    quote: string;
    canCreateLoops: boolean;
    canCreateSerum: boolean;
    canCreateDiva: boolean;
    criteriaStyle: string | null;
    criteriaQuality: string | null;
    criteriaPresentation: string | null;
    criteriaStatement: string | null;
    instagram: string | null;
    tiktok: string | null;
    facebook: string | null;
    youtube: string | null;
    x: string | null;
    linktree: string | null;
    spotify: string | null;
    soundcloud: string | null;
    beatport: string | null;
    bandcamp: string | null;
    appleMusic: string | null;
    track1: string | null;
    track2: string | null;
    track3: string | null;
    user: {
        username: string;
        email: string;
        name: string;
        surname: string | null;
        createdAt: string;
        type: string;
    };
}

type CriteriaStatus = "APPROVED" | "REFUSED" | "NOT_REVIEWED";

interface DecisionResult {
    status: "incomplete" | "accept" | "decline" | "unclear";
    message: string;
}

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
}

interface MetaRowProps {
    label: string;
    value: string;
}

interface CapabilityCardProps {
    label: string;
    active: boolean;
}

interface LinkRowProps {
    label: string;
    url: string | null;
    icon: React.ComponentType<{ className?: string }>;
    compact?: boolean;
}

interface CriteriaRowProps {
    label: string;
    question: string;
    status: CriteriaStatus;
    onChange: (status: CriteriaStatus) => void;
}

interface StatusBadgeProps {
    status: string;
}

// --- Animation Variants ---
const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ApplicationReviewPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [application, setApplication] = useState<Application | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");

    // Criteria states
    const [criteriaStyle, setCriteriaStyle] = useState<CriteriaStatus>("NOT_REVIEWED");
    const [criteriaQuality, setCriteriaQuality] = useState<CriteriaStatus>("NOT_REVIEWED");
    const [criteriaPresentation, setCriteriaPresentation] = useState<CriteriaStatus>("NOT_REVIEWED");
    const [criteriaStatement, setCriteriaStatement] = useState<CriteriaStatus>("NOT_REVIEWED");

    const fetchApplication = useCallback(async () => {
        try {
            const response = await authenticatedFetch(`/api/admin/applications/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setApplication(data.application);
                setReviewNotes(data.application.reviewNotes || "");
                setCriteriaStyle((data.application.criteriaStyle || "NOT_REVIEWED") as CriteriaStatus);
                setCriteriaQuality((data.application.criteriaQuality || "NOT_REVIEWED") as CriteriaStatus);
                setCriteriaPresentation((data.application.criteriaPresentation || "NOT_REVIEWED") as CriteriaStatus);
                setCriteriaStatement((data.application.criteriaStatement || "NOT_REVIEWED") as CriteriaStatus);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchApplication();
    }, [fetchApplication]);

    const calculateDecision = (): DecisionResult => {
        const criteria: CriteriaStatus[] = [criteriaStyle, criteriaQuality, criteriaPresentation, criteriaStatement];
        const approved = criteria.filter((c) => c === "APPROVED").length;
        const refused = criteria.filter((c) => c === "REFUSED").length;
        const notReviewed = criteria.filter((c) => c === "NOT_REVIEWED").length;

        if (notReviewed > 0) return { status: "incomplete", message: "PENDING REVIEW" };
        if (approved >= 3) return { status: "accept", message: "QUALIFIED FOR ACCEPTANCE" };
        if (refused >= 2) return { status: "decline", message: "RECOMMEND REFUSAL" };
        return { status: "unclear", message: "INCONCLUSIVE RESULT" };
    };

    const submitDecision = async () => {
        const decision = calculateDecision();
        if (decision.status === "incomplete" || decision.status === "unclear") return;

        const finalStatus = decision.status === "accept" ? "APPROVED" : "REJECTED";
        setUpdating(true);

        try {
            const response = await authenticatedFetch(`/api/admin/applications/${params.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: finalStatus,
                    reviewNotes,
                    criteriaStyle,
                    criteriaQuality,
                    criteriaPresentation,
                    criteriaStatement,
                }),
            });

            if (response.ok) {
                router.push("/admin/applications");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !application) return <LoadingScreen />;

    const decision = calculateDecision();

    return (
        <>
            {/* Top Navigation Inline */}
            <div className="flex justify-between items-center mb-12">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Console
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Status</span>
                    <StatusBadge status={application.status} />
                </div>
            </div>

            {/* --- SECTION 1: ARTIST IDENTITY (Evidence) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">

                {/* Left: Artist Profile */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
                        <div className="w-full aspect-square bg-white/5 rounded-2xl overflow-hidden mb-8 relative group">
                            {application.photoUrl ? (
                                (() => {
                                    const displayPhotoUrl = application.photoKey 
                                        ? `/api/image-proxy?key=${application.photoKey}` 
                                        : (application.photoUrl && application.photoUrl.includes("amazonaws.com"))
                                            ? `/api/image-proxy?key=${encodeURIComponent(new URL(application.photoUrl).pathname.startsWith('/') ? new URL(application.photoUrl).pathname.slice(1) : new URL(application.photoUrl).pathname)}`
                                            : application.photoUrl;

                                    return (
                                        <>
                                            <Image src={displayPhotoUrl} alt="Artist" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            <a href={displayPhotoUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-black/80 border border-white/10 text-white px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 hover:bg-white/10">
                                                <ExternalLink className="w-3 h-3" />
                                                View Image
                                            </a>
                                        </>
                                    );
                                })()
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20"><User className="w-12 h-12" /></div>
                            )}
                        </div>

                        <h1 className="font-main text-4xl uppercase mb-1">{application.artistName}</h1>
                        <div className="text-sm text-white/60 font-mono mb-6">{application.email}</div>

                        {/* User Meta Data */}
                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <MetaRow label="Username" value={`@${application.user.username}`} />
                            <MetaRow label="Joined" value={new Date(application.user.createdAt).toLocaleDateString()} />
                            <MetaRow label="Real Name" value={`${application.user.name} ${application.user.surname || ""}`} />
                        </div>
                    </div>
                </div>

                {/* Right: Assessment Data */}
                <div className="lg:col-span-8 space-y-16">

                    {/* Quote / Vision */}
                    <section>
                        <SectionHeader icon={MessageSquare} title="Artist Vision" />
                        <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2rem]">
                            <p className="text-xl font-light text-white/90 italic leading-relaxed">&ldquo;{application.quote.startsWith("Ethereal Techno is ") ? application.quote : `Ethereal Techno is ${application.quote}`}&rdquo;</p>
                        </div>
                    </section>

                    {/* Production Capabilities */}
                    <section>
                        <SectionHeader icon={Terminal} title="Capabilities" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CapabilityCard label="Sample Packs" active={application.canCreateLoops} />
                            <CapabilityCard label="Serum Presets" active={application.canCreateSerum} />
                            <CapabilityCard label="DIVA Presets" active={application.canCreateDiva} />
                        </div>
                    </section>

                    {/* Links / Tracks */}
                    <section>
                        <SectionHeader icon={Music} title="Portfolio Evidence" />
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <LinkRow label="Track Submission 1" url={application.track1} icon={ExternalLink} />
                                <SoundCloudEmbed url={application.track1} />
                            </div>
                            <div className="space-y-2">
                                <LinkRow label="Track Submission 2" url={application.track2} icon={ExternalLink} />
                                <SoundCloudEmbed url={application.track2} />
                            </div>
                            <div className="space-y-2">
                                <LinkRow label="Track Submission 3" url={application.track3} icon={ExternalLink} />
                                <SoundCloudEmbed url={application.track3} />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-[10px] font-mono uppercase text-white/40 mb-2">Socials</div>
                                {["instagram", "facebook", "x", "youtube", "tiktok"].map(key => (
                                    (application as unknown as Record<string, string | null>)[key] && <LinkRow key={key} label={key} url={(application as unknown as Record<string, string | null>)[key]} icon={Globe} compact />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] font-mono uppercase text-white/40 mb-2">Platforms</div>
                                {["spotify", "soundcloud", "beatport", "bandcamp"].map(key => (
                                    (application as unknown as Record<string, string | null>)[key] && <LinkRow key={key} label={key} url={(application as unknown as Record<string, string | null>)[key]} icon={Music} compact />
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            {/* --- SECTION 2: AUDIT PROTOCOL (Questions) --- */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeIn}
                viewport={{ once: true }}
                className="border-t border-white/10 pt-16"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <h2 className="font-mono text-primary uppercase tracking-widest text-sm">Audit Protocol</h2>
                    <div className="h-px flex-1 bg-white/10"></div>
                </div>

                <div className="space-y-4 mb-12">
                    <CriteriaRow
                        label="01 // STYLE"
                        question="Does the artist's sound clearly represent the Ethereal Techno style?"
                        status={criteriaStyle}
                        onChange={setCriteriaStyle}
                    />
                    <CriteriaRow
                        label="02 // QUALITY"
                        question="Are the productions technically solid and artistically coherent?"
                        status={criteriaQuality}
                        onChange={setCriteriaQuality}
                    />
                    <CriteriaRow
                        label="03 // PRESENTATION"
                        question="Does the artist have an authentic identity and professional presence?"
                        status={criteriaPresentation}
                        onChange={setCriteriaPresentation}
                    />
                    <CriteriaRow
                        label="04 // STATEMENT"
                        question="Does the written quote reflect a true understanding of the Ethereal Techno philosophy?"
                        status={criteriaStatement}
                        onChange={setCriteriaStatement}
                    />
                </div>

                {/* Final Decision Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12">

                    {/* Notes */}
                    <div className="lg:col-span-7 space-y-4">
                        <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Internal Audit Notes</label>
                        <textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl p-6 text-sm text-white placeholder:text-white/20 focus:border-primary focus:outline-none min-h-[140px] resize-none font-mono"
                            placeholder="Record specific feedback or reasoning..."
                        />
                    </div>

                    {/* Action */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div>
                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">System Recommendation</label>
                            <div className={`mt-2 font-main text-3xl uppercase leading-none ${decision.status === 'accept' ? 'text-green-400' :
                                decision.status === 'decline' ? 'text-red-400' : 'text-white/40'
                                }`}>
                                {decision.message}
                            </div>
                        </div>

                        <button
                            onClick={submitDecision}
                            disabled={updating || decision.status === "incomplete" || decision.status === "unclear"}
                            className={`
                                    w-full py-4 mt-6 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all
                                    ${decision.status === 'accept'
                                    ? "bg-green-500 hover:bg-green-400 text-black"
                                    : decision.status === 'decline'
                                        ? "bg-red-500 hover:bg-red-400 text-white"
                                        : "bg-white/10 text-white/30 cursor-not-allowed"}
                                `}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {decision.status === 'accept' ? "Confirm Approval" : decision.status === 'decline' ? "Confirm Rejection" : "Complete Audit"}
                        </button>
                    </div>
                </div>

            </motion.div>

        </>
    );
}

// --- Sub-Components ---

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 text-white/40">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-mono uppercase tracking-widest">{title}</span>
    </div>
);

const MetaRow: React.FC<MetaRowProps> = ({ label, value }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-[10px] font-mono text-white/30 uppercase">{label}</span>
        <span className="text-xs text-white/70">{value}</span>
    </div>
);

const CapabilityCard: React.FC<CapabilityCardProps> = ({ label, active }) => (
    <div className={`
        flex items-center gap-3 p-5 border rounded-2xl transition-colors
        ${active ? "border-green-500/30 bg-green-500/10" : "border-white/5 bg-zinc-900/40 opacity-50"}
    `}>
        {active ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/20" />}
        <span className={`text-xs font-bold uppercase tracking-wider ${active ? "text-green-100" : "text-white/40"}`}>{label}</span>
    </div>
);

const LinkRow: React.FC<LinkRowProps> = ({ label, url, icon: Icon, compact }) => {
    if (!url) return null;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                flex items-center justify-between group border border-white/5 hover:border-primary/30 bg-zinc-900/40 hover:bg-white/[0.05] transition-all
                ${compact ? "p-3 rounded-xl" : "p-5 rounded-2xl"}
            `}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <Icon className={`text-white/20 group-hover:text-primary transition-colors ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
                <span className={`text-white/60 group-hover:text-white truncate font-mono ${compact ? "text-[10px]" : "text-xs"}`}>{label}</span>
            </div>
            <ArrowLeft className={`rotate-135 text-white/20 group-hover:text-primary transition-colors ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
        </a>
    );
};

const SoundCloudEmbed: React.FC<{ url: string | null }> = ({ url }) => {
    if (!url || !url.includes("soundcloud.com/") || url.includes("/sets/")) return null;

    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=false&show_reposts=false&show_teaser=true&visual=false`;

    return (
        <div className="mt-2 border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
            <iframe
                title="SoundCloud Player"
                width="100%"
                height="120"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={src}
            />
        </div>
    );
};

const CriteriaRow: React.FC<CriteriaRowProps> = ({ label, question, status, onChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-8 border border-white/5 bg-zinc-900/40 rounded-[2rem] hover:border-white/10 transition-colors items-center mb-4">
            {/* Label */}
            <div className="md:col-span-2">
                <h4 className="font-mono text-xs text-primary/80 uppercase tracking-widest">{label}</h4>
            </div>

            {/* The Question */}
            <div className="md:col-span-6">
                <p className="text-white text-lg font-light leading-snug">
                    {question}
                </p>
            </div>

            {/* Buttons */}
            <div className="md:col-span-4 flex justify-end items-center gap-2">
                <button
                    onClick={() => onChange("APPROVED")}
                    className={`
                        flex items-center gap-2 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all
                        ${status === "APPROVED"
                            ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                            : "bg-white/5 text-white/30 hover:text-white hover:bg-white/10"
                        }
                    `}
                >
                    <Check className="w-3 h-3" />
                    Yes
                </button>
                <button
                    onClick={() => onChange("REFUSED")}
                    className={`
                        flex items-center gap-2 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all
                        ${status === "REFUSED"
                            ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            : "bg-white/5 text-white/30 hover:text-white hover:bg-white/10"
                        }
                    `}
                >
                    <X className="w-3 h-3" />
                    No
                </button>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colors: Record<string, string> = {
        APPROVED: "text-green-400 border-green-500/30 bg-green-500/10",
        REJECTED: "text-red-400 border-red-500/30 bg-red-500/10",
        UNDER_REVIEW: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
        PENDING: "text-blue-400 border-blue-500/30 bg-blue-500/10"
    };

    const style = colors[status] || colors.PENDING;

    return (
        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${style}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
};

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-black flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
    </div>
);