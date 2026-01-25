"use client";

import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
    className?: string;
}

export default function Layout({
    children,
    className = ""
}: LayoutProps) {
    return (
        <div className={`min-h-screen ${className}`}>
            {children}
        </div>
    );
}