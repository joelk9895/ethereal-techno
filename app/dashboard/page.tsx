"use client";

import { motion } from "framer-motion";
import MarketplaceHome from "@/app/dashboard/components/MarketplaceHome";
import { useRouter } from "next/navigation";

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function DashboardHomePage() {
    const router = useRouter();

    const handleNavigation = (id: string) => {
        if (id === "applications") {
            router.push("/dashboard/applications");
        }
    };

    return (
        <motion.div
            key="home"
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
        >
            <MarketplaceHome onNavigate={handleNavigation} />
        </motion.div>
    );
}
