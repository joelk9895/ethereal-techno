"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface AccessDeniedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AccessDeniedModal({ isOpen, onClose }: AccessDeniedModalProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="bg-[#1E1E1E] border border-white/5 p-8 md:p-12 w-full max-w-lg mx-4 text-center pointer-events-auto shadow-2xl relative rounded-3xl">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="font-main text-2xl uppercase text-white mb-4 tracking-tight">
                                Member Access Only
                            </h3>
                            <p className="text-white/50 text-xs font-sans mb-10 leading-relaxed tracking-wide">
                                Messaging is available to verified Ethereal Techno producers only.
                                <br />
                                Join the Circle to connect with other artists through the platform.
                            </p>

                            <button
                                onClick={() => router.push("/artist/apply")}
                                className="w-full py-4 bg-white text-black font-sans text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-colors rounded-full mb-4"
                            >
                                Apply to Join the Circle
                            </button>

                            <button
                                onClick={() => router.push("/signin")}
                                className="w-full text-white/40 text-[10px] font-sans uppercase tracking-widest hover:text-white transition-colors pt-2"
                            >
                                Already an Artist? Sign In
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
