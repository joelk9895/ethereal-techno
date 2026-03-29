"use client";

import { usePathname } from "next/navigation";
import UserLayoutClient from "./UserLayoutClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // If we're inside the producer dashboard, the ProducerLayout wraps us later down the tree.
    // We do NOT want to wrap the producer dashboard with the UserLayoutClient.
    if (pathname.startsWith("/dashboard/producer")) {
        return <>{children}</>;
    }

    // Normal user dashboard
    return <UserLayoutClient>{children}</UserLayoutClient>;
}
