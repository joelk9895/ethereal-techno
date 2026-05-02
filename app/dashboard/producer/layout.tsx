"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthUser, logout, authenticatedFetch } from "@/lib/auth";

import RightSidebar from "@/app/components/RightSidebar";
import Loading from "@/app/components/general/loading";

interface ProducerData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    type: string;
    artistName?: string;
    artistPhoto?: string | null;
    country: string | null;
    createdAt: string;
    approvedAt: string;
}

export default function ProducerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [producer, setProducer] = useState<ProducerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || (user.type !== "ARTIST" && user.type !== "ADMIN")) {
            router.push("/dashboard");
            return;
        }

        const fetchProducer = async () => {
            const res = await authenticatedFetch("/api/producer/profile");
            if (res.ok) {
                const data = await res.json();
                setProducer(data.producer);

                // Check if the user's role changed server-side (e.g. dismissed from producer)
                if (data.producer?.type && data.producer.type !== "ARTIST") {
                    const storedUser = localStorage.getItem("user");
                    if (storedUser) {
                        try {
                            const parsed = JSON.parse(storedUser);
                            parsed.type = data.producer.type;
                            localStorage.setItem("user", JSON.stringify(parsed));
                        } catch {
                            // ignore
                        }
                    }
                    router.replace("/dashboard");
                    return;
                }
            } else if (res.status === 403 || res.status === 401) {
                // User is no longer a producer — update localStorage and redirect
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        parsed.type = "USER";
                        localStorage.setItem("user", JSON.stringify(parsed));
                    } catch {
                        // ignore
                    }
                }
                router.replace("/dashboard");
                return;
            } else {
                console.error("Failed to fetch producer profile");
            }
            setLoading(false);
        };

        fetchProducer();
    }, [router]);

    const handleNavigation = (id: string) => {
        if (id === "sounds") return router.push("/sounds");
        if (id === "bundles") return router.push("/bundles");
        if (id === "merch") return router.push("/merch");
        if (id === "free-content") return router.push("/free/content");

        switch (id) {
            case "overview":
                router.push("/dashboard/producer");
                break;
            case "profile":
                router.push(`/artist/${producer?.username}`);
                break;
            case "billing":
                router.push("/dashboard/producer/billing");
                break;
            case "orders":
                router.push("/dashboard/producer/orders");
                break;
            case "messages":
                router.push("/dashboard/producer/messages");
                break;
            default:
                router.push("/dashboard/producer");
        }
    };

    let activeTab = "overview";
    if (pathname.includes("/messages")) activeTab = "messages";
    else if (pathname.includes("/profile")) activeTab = "profile";
    else if (pathname.includes("/billing")) activeTab = "billing";
    else if (pathname.includes("/orders")) activeTab = "orders";

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (!producer) return null;

    return (
        <div className="flex h-[100dvh] pt-[88px] bg-background text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative box-border">

            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                <RightSidebar
                    user={{ ...producer, type: "ARTIST" }}
                    activeTab={activeTab}
                    onNavigate={handleNavigation}
                    onSignOut={() => logout().then(() => router.push("/signin"))}
                />
                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pb-32 lg:pb-12 no-scrollbar relative z-10 px-6 md:px-16">
                    <div className="mx-auto w-full min-h-full flex flex-col">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
