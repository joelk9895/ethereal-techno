"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthUser, logout } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import RightSidebar from "@/app/components/RightSidebar";

interface AdminUserData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    type: string;
    country: string;
    createdAt: string;
    approvedAt: string | null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [authUser, setAuthUser] = useState<AdminUserData | null>(null);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.type !== "ADMIN") {
            router.push("/dashboard");
            return;
        }
        setAuthUser(user as unknown as AdminUserData);
        setLoading(false);
    }, [router]);

    if (loading || !authUser) {
        return (
            <div className="flex h-screen bg-background items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono tracking-widest text-white/50">
                        LOADING ADMIN...
                    </span>
                </div>
            </div>
        );
    }

    let activeTab = "admin-dashboard";
    if (pathname.includes("/admin/applications")) activeTab = "applications";
    else if (pathname.includes("/admin/producers")) activeTab = "producers";
    else if (pathname.includes("/admin/users")) activeTab = "users";
    else if (pathname.includes("/admin/news")) activeTab = "news";

    return (
        <div className="flex h-screen bg-background text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">
                <RightSidebar
                    user={authUser}
                    activeTab={activeTab}
                    onNavigate={(id) => {
                        if (id === "admin-dashboard") router.push("/admin");
                        else router.push(`/admin/${id}`);
                    }}
                    onSignOut={async () => {
                        await logout();
                        router.push("/signin");
                    }}
                />

                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pb-32 lg:pb-12 no-scrollbar relative z-10 px-6 md:px-16 pt-16">
                    <div className="mx-auto w-full max-w-none flex flex-col mb-16">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
