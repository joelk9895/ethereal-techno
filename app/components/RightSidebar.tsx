"use client";

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
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

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
                group w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-all duration-300
                ${active
                    ? "bg-white/[0.08] text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "border-transparent text-white/40 hover:text-white hover:border-white/5"
                }
            `}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-4 h-4 transition-colors ${active ? "text-primary" : "text-white/40 group-hover:text-white"}`} />
                <span className={`text-xs font-sans uppercase tracking-widest transition-colors ${active ? "text-white font-semibold" : "text-white/40 group-hover:text-white"}`}>
                    {label}
                </span>
            </div>
            {external && <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />}
        </motion.button>
    </div>
);

export default function RightSidebar({ user, activeTab, onNavigate, onSignOut }: RightSidebarProps) {
    return (
        <aside className="w-full lg:w-80 lg:h-full border-l border-white/5 bg-black/50 backdrop-blur-xl z-20 pt-24 pb-12 px-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div>
                <div className="mb-8 px-4">
                    <div className="text-xs font-sans text-white/40 uppercase tracking-widest mb-4">My Account</div>
                    <h1 className="font-main text-3xl text-white uppercase leading-none break-words tracking-wide mb-3">
                        {user.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-sans text-primary uppercase tracking-widest">@{user.username}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-xs font-sans text-white/40 uppercase tracking-widest font-medium">{user.type}</span>
                    </div>
                </div>

                <nav className="space-y-1">
                    {user.type === "ARTIST" ? (
                        <>
                            <NavItem
                                id="overview"
                                label="Overview"
                                icon={LayoutDashboard}
                                active={activeTab === "overview"}
                                onClick={() => onNavigate("overview")}
                            />
                            <NavItem
                                id="profile"
                                label="Profile & Socials"
                                icon={User}
                                active={activeTab === "profile"}
                                onClick={() => onNavigate("profile")}
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
                                label="Overview"
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
                                label="Applications"
                                icon={FileText}
                                active={activeTab === "applications"}
                                onClick={() => onNavigate("applications")}
                            />
                        </>
                    )}
                </nav>

                <div className="mt-12">
                    <div className="space-y-1">
                        {user.type === "ARTIST" && (
                            <NavItem
                                id="free-content"
                                label="Free Packs Zone"
                                icon={ArrowUpRight}
                                active={false}
                                onClick={() => onNavigate("free-content")}
                                external
                            />
                        )}
                        <NavItem
                            id="community"
                            label="Community Hub"
                            icon={Users}
                            active={false}
                            onClick={() => onNavigate("community")}
                            external
                        />
                        <NavItem
                            id="shop"
                            label="Browse Shop"
                            icon={ShoppingBag}
                            active={false}
                            onClick={() => onNavigate("shop")}
                            external
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <button
                    onClick={onSignOut}
                    className="group w-full flex items-center justify-start gap-4 py-3 px-4 rounded-xl border border-transparent transition-all duration-300 text-white/40 hover:text-red-400 hover:bg-white/5"
                >
                    <LogOut className="w-4 h-4 transition-colors" />
                    <span className="text-xs font-sans uppercase tracking-widest">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
