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
    CreditCard,
    Music,
    Package
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
                group w-full flex items-center justify-between py-4 px-5 rounded-xl border transition-all duration-300
                ${active
                    ? "bg-white/[0.1] text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    : "border-transparent text-white/50 hover:text-white hover:border-white/10 hover:bg-white/5"
                }
            `}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-white/40 group-hover:text-white"}`} />
                <span className={`text-sm font-sans uppercase tracking-widest font-medium transition-colors ${active ? "text-white" : "text-white/40 group-hover:text-white"}`}>
                    {label}
                </span>
            </div>
            {external && <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />}
        </motion.button>
    </div>
);

export default function RightSidebar({ user, activeTab, onNavigate, onSignOut }: RightSidebarProps) {
    return (
        <aside className="w-full lg:w-80 lg:h-full border-l border-white/10 bg-black/80 backdrop-blur-2xl z-20 pt-24 pb-12 px-8 flex flex-col justify-between overflow-y-auto no-scrollbar shadow-2xl">
            <div>
                <div className="mb-10 px-2">
                    <div className="text-sm font-sans text-white/60 uppercase tracking-widest mb-6">My Account</div>
                    <h1 className="font-main text-4xl text-white uppercase leading-none break-words tracking-wide mb-2">
                        {user.name}
                    </h1>
                </div>

                <nav className="space-y-2">
                    {user.type === "ARTIST" ? (
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
                                label="Applications"
                                icon={FileText}
                                active={activeTab === "applications"}
                                onClick={() => onNavigate("applications")}
                            />
                        </>
                    )}
                </nav>

                <div className="mt-12">
                    <div className="space-y-2">
                        <NavItem
                            id="sounds"
                            label="Browse Sounds"
                            icon={Music}
                            active={false}
                            onClick={() => onNavigate("sounds")}
                            external
                        />
                        <NavItem
                            id="bundles"
                            label="Browse Bundles"
                            icon={Package}
                            active={false}
                            onClick={() => onNavigate("bundles")}
                            external
                        />
                        <NavItem
                            id="merch"
                            label="Browse Merch"
                            icon={ShoppingBag}
                            active={false}
                            onClick={() => onNavigate("merch")}
                            external
                        />
                        <NavItem
                            id="free-content"
                            label="Free Packs"
                            icon={ArrowUpRight}
                            active={false}
                            onClick={() => onNavigate("free-content")}
                            external
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <button
                    onClick={onSignOut}
                    className="group w-full flex items-center justify-start gap-4 py-4 px-5 rounded-xl border border-transparent transition-all duration-300 text-white/40 hover:text-red-400 hover:bg-white/5"
                >
                    <LogOut className="w-5 h-5 transition-colors" />
                    <span className="text-sm font-sans uppercase tracking-widest font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
