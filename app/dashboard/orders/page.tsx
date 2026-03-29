"use client";

import { motion } from "framer-motion";
import { History as HistoryIcon } from "lucide-react";
import { useUserDashboard } from "../UserLayoutClient";

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export default function DashboardOrdersPage() {
    const { user } = useUserDashboard();

    if (!user) return null;

    return (
        <motion.div
            key="orders"
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            className="w-full max-w-none"
        >
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">Order History</h2>
                    <p className="text-white/50 text-lg font-light">View your past transactions.</p>
                </div>
            </div>
            <div className="bg-[#1E1E1E] rounded-3xl p-12 border border-white/5 text-center flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <HistoryIcon className="w-8 h-8 text-white/20" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-xl text-white font-medium uppercase tracking-wide">No past orders</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                        Your transaction history will appear here once you make a purchase.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
