import { X, Send } from "lucide-react";
import { useState } from "react";

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    artistName: string;
}

export function MessageModal({ isOpen, onClose, artistName }: MessageModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSending(false);
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setSubject("");
            setMessage("");
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-lg bg-[#1E1E1E] border border-white/5 p-8 rounded-3xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-main font-bold uppercase tracking-tight mb-2">Message {artistName}</h2>
                <p className="text-white/50 text-xs font-sans mb-8 tracking-wide">Connect with a fellow producer.</p>

                {sent ? (
                    <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 mx-auto bg-primary/20 text-primary rounded-full flex items-center justify-center">
                            <Send size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Message Sent</h3>
                        <p className="text-white/50 text-sm">Your message has been delivered to {artistName}.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-sans uppercase tracking-widest text-white/40 font-medium">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-[#121212] border border-white/5 p-4 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20"
                                placeholder="Collab request, Question, etc."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-sans uppercase tracking-widest text-white/40 font-medium">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-[#121212] border border-white/5 p-4 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-colors min-h-[150px] resize-none placeholder:text-white/20"
                                placeholder="Write your message here..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-3 bg-white text-black font-sans text-sm font-medium rounded-full uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {sending ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
