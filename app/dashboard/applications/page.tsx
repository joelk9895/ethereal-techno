"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserDashboard } from "../UserLayoutClient";

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export default function DashboardApplicationsPage() {
    const router = useRouter();
    const { user, applications } = useUserDashboard();

    if (!user) return null;

    return (
        <motion.div
            key="circle-status"
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            className="w-full max-w-none"
        >
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">
                        {applications.length > 0 ? "Circle Status" : "Join the Circle"}
                    </h2>
                    <p className="text-white/50 text-lg font-light">
                        {applications.length > 0
                            ? "Track your application and membership status within the Circle."
                            : "Apply to become a verified member of the Ethereal Techno Circle."}
                    </p>
                </div>
                {user.type === "USER" && (!applications.length || applications.every(a => a.status === "REJECTED")) && (
                    <button
                        onClick={() => router.push("/artist/apply")}
                        className="hidden md:flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Apply to Join
                    </button>
                )}
            </div>

            {/* Case 4: APPROVED — user is already an ARTIST */}
            {user.type === "ARTIST" ? (
                <div className="py-16 border-y border-white/10">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <span className="text-xs font-mono uppercase tracking-widest text-green-400">Approved</span>
                        </div>
                        <h3 className="font-main text-3xl md:text-4xl uppercase text-white mb-6">Welcome to the Circle</h3>
                        <div className="space-y-4 text-white/60 text-base font-light leading-relaxed">
                            <p>Your application has been approved.</p>
                            <p>You are now a verified member of the Ethereal Techno Circle.</p>
                        </div>
                    </div>
                </div>
            ) : applications.length === 0 ? (
                /* Case 1: NO APPLICATION */
                <div className="py-16 border-y border-white/10">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-white/60 text-lg font-light mb-8">You have not applied to join the Circle yet.</p>
                        <button
                            onClick={() => router.push("/artist/apply")}
                            className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                        >
                            Apply to Join <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                /* Case 2 & 3: PENDING or REFUSED */
                <div className="space-y-6">
                    {applications.map((app) => {
                        if (app.status === "REJECTED") {
                            /* Case 3: REFUSED */
                            return (
                                <div key={app.id} className="py-16 border-y border-white/10">
                                    <div className="max-w-2xl mx-auto text-center">
                                        <div className="flex items-center justify-center gap-3 mb-6">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <span className="text-xs font-mono uppercase tracking-widest text-red-400">Not Approved</span>
                                        </div>
                                        <h3 className="font-main text-3xl md:text-4xl uppercase text-white mb-6">Application Not Approved</h3>
                                        <div className="space-y-4 text-white/60 text-base font-light leading-relaxed">
                                            <p>Thank you for your interest in joining the Ethereal Techno Circle.</p>
                                            <p>After careful review, your application was not approved at this time.</p>
                                            <p>We encourage you to continue developing your artistic direction and apply again when you feel your work aligns closely with the Ethereal Techno aesthetic.</p>
                                        </div>
                                        <button
                                            onClick={() => router.push("/artist/apply")}
                                            className="mt-8 inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                                        >
                                            Apply Again <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        /* Case 2: PENDING / UNDER_REVIEW */
                        return (
                            <div key={app.id} className="py-16 border-y border-white/10 relative overflow-hidden group">
                                {/* Ambient Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.02] blur-3xl rounded-full pointer-events-none group-hover:bg-white/[0.03] transition-colors duration-700" />
                                
                                <div className="max-w-3xl mx-auto text-center relative z-10 px-6">
                                    <div className="flex flex-col items-center gap-6 mb-10">
                                        <div className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: "0ms" }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: "300ms" }} />
                                        </div>
                                        <span className="text-xs font-mono uppercase tracking-[0.3em] text-white/60">
                                            {app.status === "UNDER_REVIEW" ? "Under Review" : "Pending Review"}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-main text-4xl md:text-5xl uppercase text-white mb-8">Application Received</h3>
                                    
                                    <div className="space-y-6 text-white/50 text-lg font-light leading-relaxed max-w-2xl mx-auto">
                                        <p>
                                            Your application for <span className="text-white font-medium">{app.artistName}</span> is currently in our queue. 
                                            Our curation team listens to every submission carefully to ensure alignment with the Ethereal Techno sound.
                                        </p>
                                        <p>
                                            Due to the extremely high volume of applications we receive daily, the review process typically takes <span className="text-white font-medium group-hover:text-white/80 transition-colors">7-14 business days</span>.
                                        </p>
                                        <p className="text-sm border-t border-white/10 pt-6 mt-8">
                                            We will notify you via email as soon as a decision is made. Thank you for your patience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
