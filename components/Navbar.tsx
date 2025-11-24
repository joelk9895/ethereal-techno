"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Menu,
    X,
    User,
    LogOut,
    Home,
    Music,
    Users,
    Gift,
    Settings,
    Shield,
    Sparkles,
    Circle
} from "lucide-react";
import { getAuthUser, logout, type AuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
    variant?: "default" | "minimal" | "transparent";
    fixed?: boolean;
}

export default function Navbar({ variant = "default", fixed = true }: NavbarProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const authUser = getAuthUser();
        setUser(authUser);
    }, []);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    // Navigation items based on user type
    const getNavItems = () => {
        const baseItems = [
            { label: "Home", href: "/", icon: Home },
            { label: "Shop", href: "/shop", icon: Music },
        ];

        if (!user) {
            return [
                ...baseItems,
                { label: "Community", href: "/community", icon: Users },
                { label: "Free", href: "/free", icon: Gift },
                { label: "Sign In", href: "/signin", icon: User },
            ];
        }

        // Authenticated user items
        const authItems = [...baseItems];

        // Add role-specific items
        switch (user.type) {
            case "ADMIN":
                authItems.push(
                    { label: "Applications", href: "/admin/applications", icon: Shield },
                    { label: "Producers", href: "/admin/producers", icon: Users },
                );
                break;

            case "ARTIST":
                authItems.push(
                    { label: "Producer Hub", href: "/dashboard/producer", icon: Sparkles },
                );
                break;

            case "USER":
                authItems.push(
                    { label: "Community", href: "/community", icon: Users },
                    { label: "Free", href: "/free", icon: Gift },
                    { label: "Apply", href: "/artist/apply", icon: Circle },
                );
                break;

        
        }

        // Add dashboard for all authenticated users
        authItems.push({ label: "Profile", href: "/dashboard", icon: Settings });

        return authItems;
    };

    const navItems = getNavItems();

    const navbarClass = `
    ${fixed ? "fixed" : "relative"} top-0 left-0 w-full z-50 transition-all duration-300
    ${variant === "transparent"
            ? "bg-transparent"
            : variant === "minimal"
                ? "bg-black/80 backdrop-blur-md border-b border-white/10"
                : "bg-black/95 backdrop-blur-md border-b border-white/10"
        }
  `;

    return (
        <nav className={navbarClass}>
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex items-center justify-between h-20">

                    <Link href="/" className="flex items-center gap-3 group">
                       
                        <span className="font-main text-xl uppercase tracking-wide text-white group-hover:text-primary transition-colors">
                            Ethereal Techno
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all
                    ${isActive
                                            ? "bg-primary text-black"
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                        }
                  `}
                                >
                                    <Icon className="w-3 h-3" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu (Desktop) */}
                    {user && (
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                    {user.username?.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white">
                                        {user.username}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 uppercase">
                                        {user.type}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-black border-t border-white/10"
                    >
                        <div className="px-6 py-6 space-y-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${isActive
                                                ? "bg-primary text-black"
                                                : "text-white/70 hover:text-white hover:bg-white/5"
                                            }
                    `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="font-bold uppercase tracking-wide text-sm">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}

                            {/* Mobile User Info & Logout */}
                            {user && (
                                <div className="pt-4 border-t border-white/10 space-y-4">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                                            {user.username?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">
                                                {user.username}
                                            </div>
                                            <div className="text-xs font-mono text-white/40 uppercase">
                                                {user.type} Account
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="font-bold uppercase tracking-wide text-sm">
                                            Logout
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}