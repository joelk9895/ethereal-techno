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
                        <div className="bg-neutral-900 border border-white/10 p-8 md:p-12 w-full max-w-lg mx-4 text-center pointer-events-auto shadow-2xl relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="font-main text-3xl uppercase text-white mb-4">
                                Member Access Only
                            </h3>
                            <p className="text-white/70 text-lg mb-8 leading-relaxed">
                                Messaging is available to verified Ethereal Techno producers only.
                                <br />
                                Join the Circle to connect with other artists through the platform.
                            </p>

                            <button
                                onClick={() => router.push("/artist/apply")}
                                className="w-full py-4 bg-white text-black font-main text-xl uppercase tracking-wider hover:bg-primary transition-colors font-bold mb-4"
                            >
                                Apply to Join the Circle
                            </button>

                            <button
                                onClick={() => router.push("/signin")}
                                className="w-full text-white/50 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
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
