"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
    children: ReactNode;
    navbarVariant?: "default" | "minimal" | "transparent";
    showNavbar?: boolean;
    className?: string;
}

export default function Layout({
    children,
    navbarVariant = "default",
    showNavbar = true,
    className = ""
}: LayoutProps) {
    return (
        <div className={`min-h-screen bg-black ${className}`}>
            {showNavbar && <Navbar variant={navbarVariant} />}
            <main className={showNavbar ? "pt-20" : ""}>
                {children}
            </main>
        </div>
    );
}