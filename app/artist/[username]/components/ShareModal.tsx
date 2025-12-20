"use client";

import { X, Copy, Check, Facebook } from "lucide-react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    artistName: string;
    url: string;
}

interface IconProps {
    className?: string;
    [key: string]: unknown;
}

export function ShareModal({ isOpen, onClose, artistName, url }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: (props: IconProps) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
            url: `https://wa.me/?text=${encodeURIComponent(`Check out ${artistName} on Ethereal Techno: ${url}`)}`,
            color: "hover:bg-[#25D366] hover:text-white"
        },
        {
            name: "X",
            icon: (props: IconProps) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            ),
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${artistName} on Ethereal Techno`)}&url=${encodeURIComponent(url)}`,
            color: "hover:bg-black hover:text-white"
        },
        {
            name: "Facebook",
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: "hover:bg-[#1877F2] hover:text-white"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="bg-neutral-900 border border-white/10 p-8 w-full max-w-sm mx-4 text-center pointer-events-auto relative shadow-2xl">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="font-main text-2xl uppercase text-white mb-8">
                                Share Artist
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {shareLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/5 transition-all text-white/60 ${link.color}`}
                                    >
                                        <link.icon className="w-6 h-6" />
                                        <span className="text-[10px] font-mono uppercase tracking-wider">{link.name}</span>
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-black border border-white/10 rounded-lg">
                                <span className="text-xs text-white/50 font-mono truncate px-2 flex-1 text-left">
                                    {url}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/70 hover:text-white"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
