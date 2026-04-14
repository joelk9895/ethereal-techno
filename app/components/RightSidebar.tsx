"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    User,
    FileText,
    ArrowUpRight,
    LogOut,
    LucideIcon,
    Users,
    ShoppingBag,
    History,
    Library,
    CreditCard,
    Music,
    Package,
    Radio,
    FileCheck,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authenticatedFetch } from "@/lib/auth";

interface UserData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string | null;
    type: string;
    country: string | null;
    createdAt: string;
    approvedAt: string | null;
    artistPhoto?: string | null;
    artistName?: string;
}

interface RightSidebarProps {
    user: UserData;
    activeTab: string;
    onNavigate: (id: string) => void;
    onSignOut?: () => void;
}

interface NavItemProps {
    id: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    onClick: () => void;
    external?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, external }) => (
    <div className="relative w-full">
        <motion.button
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            onClick={onClick}
            className={`
                group w-full flex items-center justify-between py-4 px-5 rounded-xl border transition-all duration-300
                ${active
                    ? "bg-white/[0.1] text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    : "border-transparent text-white/50 hover:text-white hover:border-white/10 hover:bg-white/5"
                }
            `}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-white/40 group-hover:text-white"}`} />
                <span className={`text-sm font-sans uppercase tracking-wider font-medium whitespace-nowrap transition-colors ${active ? "text-white" : "text-white/40 group-hover:text-white"}`}>
                    {label}
                </span>
            </div>
            {external && <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />}
        </motion.button>
    </div>
);

export default function RightSidebar({ user, activeTab, onNavigate, onSignOut }: RightSidebarProps) {
    const [hasApplication, setHasApplication] = useState(false);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        if (user.type !== "USER") return;
        const checkApplication = async () => {
            try {
                const response = await authenticatedFetch("/api/artist/apply");
                if (response.ok) {
                    const data = await response.json();
                    setHasApplication(data.exists && !!data.application);
                }
            } catch (error) {
                console.error("Error checking application status:", error);
            }
        };
        checkApplication();
    }, [user.type]);

    return (
        <aside className="w-full lg:w-80 lg:h-full border-l border-white/10 bg-black/80 backdrop-blur-2xl z-20 pt-8 pb-12 px-8 flex flex-col justify-between overflow-y-auto no-scrollbar shadow-2xl">
            <div>
                <div className="mb-10 px-2">
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
                        My Account
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-white/10 flex-shrink-0">
                            {user.artistPhoto ? (
                                <img src={user.artistPhoto} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-main text-white/60 uppercase">
                                    {(user.artistName || user.name)?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h1 className="font-main text-4xl text-white uppercase leading-none overflow-hidden text-ellipsis whitespace-nowrap tracking-wide">
                            {user.artistName || user.name}
                        </h1>
                    </div>

                    <button
                        onClick={() => window.open('/', '_blank')}
                        className="mt-6 w-full flex items-center justify-start gap-4 py-4 px-5 rounded-xl bg-primary text-black font-sans text-sm uppercase tracking-wider font-bold hover:bg-white transition-all duration-300 group shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-white/10"
                    >
                        <Globe className="w-5 h-5 flex-shrink-0" />
                        <div className="flex items-center justify-between flex-1">
                            <span>View Site</span>
                            <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>
                </div>

                <div className="px-2">
                    <nav className="space-y-2">
                    {user.type === "ADMIN" ? (
                        <>
                            <NavItem
                                id="admin-dashboard"
                                label="Admin Home"
                                icon={LayoutDashboard}
                                active={activeTab === "admin-dashboard"}
                                onClick={() => onNavigate("admin-dashboard")}
                            />
                            <NavItem
                                id="applications"
                                label="Applications"
                                icon={FileCheck}
                                active={activeTab === "applications"}
                                onClick={() => onNavigate("applications")}
                            />
                            <NavItem
                                id="producers"
                                label="Producers"
                                icon={Music}
                                active={activeTab === "producers"}
                                onClick={() => onNavigate("producers")}
                            />
                            <NavItem
                                id="users"
                                label="Users"
                                icon={Users}
                                active={activeTab === "users"}
                                onClick={() => onNavigate("users")}
                            />
                            <NavItem
                                id="news"
                                label="News & Updates"
                                icon={Radio}
                                active={activeTab === "news"}
                                onClick={() => onNavigate("news")}
                            />
                        </>
                    ) : user.type === "ARTIST" ? (
                        <>
                            <NavItem
                                id="overview"
                                label="Dashboard"
                                icon={LayoutDashboard}
                                active={activeTab === "overview"}
                                onClick={() => onNavigate("overview")}
                            />
                            <NavItem
                                id="profile"
                                label="Profile"
                                icon={User}
                                active={activeTab === "profile"}
                                onClick={() => onNavigate("profile")}
                            />
                            <NavItem
                                id="messages"
                                label="Messages"
                                icon={MessageSquare}
                                active={activeTab === "messages"}
                                onClick={() => onNavigate("messages")}
                            />
                            <NavItem
                                id="billing"
                                label="Billing Details"
                                icon={CreditCard}
                                active={activeTab === "billing"}
                                onClick={() => onNavigate("billing")}
                            />
                            <NavItem
                                id="orders"
                                label="Order History"
                                icon={ShoppingBag}
                                active={activeTab === "orders"}
                                onClick={() => onNavigate("orders")}
                            />
                        </>
                    ) : (
                        <>
                            <NavItem
                                id="home"
                                label="Dashboard"
                                icon={LayoutDashboard}
                                active={activeTab === "home"}
                                onClick={() => onNavigate("home")}
                            />
                            <NavItem
                                id="library"
                                label="My Library"
                                icon={Library}
                                active={activeTab === "library"}
                                onClick={() => onNavigate("library")}
                            />
                            <NavItem
                                id="orders"
                                label="Order History"
                                icon={History}
                                active={activeTab === "orders"}
                                onClick={() => onNavigate("orders")}
                            />
                            <NavItem
                                id="profile"
                                label="Edit Profile"
                                icon={User}
                                active={activeTab === "profile"}
                                onClick={() => onNavigate("profile")}
                            />
                            <NavItem
                                id="applications"
                                label={hasApplication ? "Circle Status" : "Join the Circle"}
                                icon={FileText}
                                active={activeTab === "applications"}
                                onClick={() => onNavigate("applications")}
                            />
                        </>
                    )}
                </nav>

                {user.type !== "ADMIN" && (
                    <div className="mt-12 space-y-2 px-2">
                        <NavItem
                            id="sounds"
                            label="Browse Sounds"
                            icon={Music}
                            active={false}
                            onClick={() => {
                                onNavigate("sounds");
                                window.open('/browse/sounds', '_blank');
                            }}
                            external
                        />
                        <NavItem
                            id="bundles"
                            label="Browse Bundles"
                            icon={Package}
                            active={false}
                            onClick={() => {
                                onNavigate("bundles");
                                window.open('/browse/bundles', '_blank');
                            }}
                            external
                        />
                        <NavItem
                            id="merch"
                            label="Browse Merch"
                            icon={ShoppingBag}
                            active={false}
                            onClick={() => {
                                onNavigate("merch");
                                window.open('/browse/merch', '_blank');
                            }}
                            external
                        />
                        {user.type === "ARTIST" && (
                            <NavItem
                                id="free-content"
                                label="Free Packs"
                                icon={ArrowUpRight}
                                active={false}
                                onClick={() => {
                                    onNavigate("free-content");
                                    window.open('/free/content', '_blank');
                                }}
                                external
                            />
                        )}
                    </div>
                )}
                </div>
            </div>

            <div className="mt-12 px-2">
                <button
                    onClick={onSignOut}
                    className="group w-full flex items-center justify-start gap-4 py-4 px-5 rounded-xl border border-transparent transition-all duration-300 text-white/40 hover:text-red-400 hover:bg-white/5"
                >
                    <LogOut className="w-5 h-5 transition-colors" />
                    <span className="text-sm font-sans uppercase tracking-wider font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
