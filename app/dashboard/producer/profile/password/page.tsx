"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, ArrowLeft, Loader2 } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { motion } from "framer-motion";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setSaving(true);
        try {
            const res = await authenticatedFetch("/api/producer/profile", {
                method: "PATCH",
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/dashboard/producer/profile?passwordChanged=true");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to change password.");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto pb-20 pt-24 px-6 md:px-0">
            <button
                onClick={() => router.push("/dashboard/producer/profile")}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border border-white/5 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-md"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Key className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-main text-white uppercase tracking-wide">Change Password</h2>
                        <p className="text-white/40 text-sm mt-1">Update your account security credentials.</p>
                    </div>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-6">
                    <div className="space-y-2 group/input">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 pl-1 group-focus-within/input:text-primary transition-colors">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 placeholder:text-white/10 transition-all font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2 group/input">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 pl-1 group-focus-within/input:text-primary transition-colors">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 placeholder:text-white/10 transition-all font-medium"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm px-2">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-black font-bold uppercase tracking-widest text-xs transition-colors hover:bg-primary/90 rounded-2xl disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
