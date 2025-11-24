"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const user = getAuthUser();
        if (!user) {
            router.push("/signin");
        } else if (user.type !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [router]);

    return <>{children}</>;
}