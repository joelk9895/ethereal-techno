"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAuthUser, logout, authenticatedFetch } from "@/lib/auth";
import RightSidebar from "@/app/components/RightSidebar";

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

interface Application {
    id: string;
    artistName?: string;
    status: string;
    createdAt?: string;
    reviewNotes?: string | null;
    reviewedAt?: string | null;
}

interface DashboardContextType {
    user: UserData | null;
    setUser: (u: UserData) => void;
    applications: Application[];
    setApplications: (a: Application[]) => void;
}

export const UserDashboardContext = createContext<DashboardContextType | null>(null);

export function useUserDashboard() {
    const context = useContext(UserDashboardContext);
    if (!context) {
        throw new Error("useUserDashboard must be used within a UserDashboardContext.Provider");
    }
    return context;
}

export default function UserLayoutClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserData | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch("/api/user/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            router.push("/signin");
        }
    }, [router]);

    const fetchApplications = useCallback(async () => {
        try {
            const response = await authenticatedFetch("/api/artist/apply");
            if (response.ok) {
                const data = await response.json();
                if (data.exists && data.application) {
                    setApplications([data.application]);
                } else {
                    setApplications([]);
                }
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        }
    }, []);

    useEffect(() => {
        const authUser = getAuthUser();
        if (!authUser) {
            router.replace("/signin");
            return;
        }

        switch (authUser.type) {
            case "ADMIN":
                router.replace("/admin");
                break;
            case "ARTIST":
                router.replace("/dashboard/producer");
                break;
            case "USER":
            default:
                break;
        }

        fetchUserData();
        fetchApplications();
        setLoading(false);
    }, [router, fetchUserData, fetchApplications]);

    const handleNavigation = (id: string) => {
        if (id === "sounds") return router.push("/libraries");
        if (id === "bundles") return router.push("/bundles");
        if (id === "merch") return router.push("/merch");
        if (id === "free-content" && user && (user.type === "ARTIST" || user.type === "ADMIN")) {
            return router.push("/free/content");
        }
        if (id === "community") return router.push("/community");

        // Internal routing mapped to URLs
        switch (id) {
            case "library": router.push("/dashboard/library"); break;
            case "orders": router.push("/dashboard/orders"); break;
            case "profile": router.push("/dashboard/profile"); break;
            case "applications": router.push("/dashboard/applications"); break;
            case "home":
            default:
                router.push("/dashboard"); break;
        }
    };

    const handleSignOut = useCallback(() => {
        logout();
        router.push("/signin");
    }, [router]);

    let activeTab = "home";
    if (pathname.includes("/dashboard/library")) activeTab = "library";
    else if (pathname.includes("/dashboard/orders")) activeTab = "orders";
    else if (pathname.includes("/dashboard/profile")) activeTab = "profile";
    else if (pathname.includes("/dashboard/applications")) activeTab = "applications";

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono tracking-widest text-white/50">LOADING PROFILE...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <UserDashboardContext.Provider value={{ user, setUser, applications, setApplications }}>
            <div className="flex h-screen bg-background text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                    <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">
                    <RightSidebar
                        user={user}
                        activeTab={activeTab}
                        onNavigate={handleNavigation}
                        onSignOut={handleSignOut}
                    />

                    <main className="flex-1 lg:overflow-y-auto pt-24 px-6 lg:px-8 pb-24 relative no-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </UserDashboardContext.Provider>
    );
}
