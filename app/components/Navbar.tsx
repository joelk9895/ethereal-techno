"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";

const baseNavLinks = [
  { label: "HOME", href: "/" },
  { label: "SOUNDS", href: "/sounds" },
  { label: "BUNDLES", href: "/bundles" },
  { label: "CIRCLE", href: "/community" },
  { label: "MUSIC", href: "/music" },
  { label: "MERCH", href: "/merch" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    const user = getAuthUser();
    const token = localStorage.getItem("accessToken");
    setHasToken(!!token && !!user);
    if (user) {
      switch (user.type) {
        case "ADMIN": setDashboardHref("/admin"); break;
        case "ARTIST": setDashboardHref("/dashboard/producer"); break;
        default: setDashboardHref("/dashboard"); break;
      }
    } else {
      setHasToken(false);
    }
  }, [pathname]);

  // Build final nav links based on auth state
  const navLinks = hasToken
    ? [...baseNavLinks, { label: "DASHBOARD", href: dashboardHref }, { label: "LOGOUT", href: "" }]
    : [...baseNavLinks, { label: "LOGIN", href: "/signin" }];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setHasToken(false);
    setMenuOpen(false);
    window.location.href = "/signin";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const menuVariants = {
    closed: {
      clipPath: "circle(0% at calc(100% - 3rem) 3rem)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    },
    open: {
      clipPath: "circle(150% at calc(100% - 3rem) 3rem)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    })
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-md transition-colors duration-500 transform-gpu"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="font-main text-2xl uppercase tracking-wider text-white relative z-[110] drop-shadow-md"
          >
            <div className="w-36 sm:w-52">
              <Image src="/logo.svg" alt="Logo" width={300} height={300} className="w-full h-auto" />
            </div>
          </Link>

          <div className="flex items-center gap-4 relative z-[110]">
            {hasToken ? (
              !pathname.startsWith("/dashboard") && !pathname.startsWith("/admin") && (
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-sans uppercase tracking-widest font-semibold hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )
            ) : (
              <Link
                href="/signin"
                className="px-4 py-2 rounded-full border border-white/20 text-white text-xs font-sans uppercase tracking-widest font-semibold hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-white/80 transition-transform p-2 drop-shadow-md"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <motion.div
                  animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
                  className="absolute w-6 h-[2px] bg-white transition-all duration-300"
                />
                <motion.div
                  animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  className="absolute w-6 h-[2px] bg-white transition-all duration-300"
                />
                <motion.div
                  animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
                  className="absolute w-6 h-[2px] bg-white transition-all duration-300"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <motion.div
        initial="closed"
        animate={menuOpen ? "open" : "closed"}
        variants={menuVariants}
        className="fixed inset-0 z-[90] bg-[#0A0A0A] overflow-hidden"
      >
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[80vw] h-[80vw] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 text-[20vw] font-main text-white/[0.02] leading-none pointer-events-none select-none">
          ETHEREAL
        </div>

        <div className="h-[100dvh] w-full pt-[100px] pb-8 flex flex-col justify-center">
          <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10 flex flex-col justify-center h-full">
            <nav className="flex flex-col justify-center gap-2 md:gap-4 pl-8 md:pl-24 lg:pl-48 max-h-full overflow-y-auto no-scrollbar pr-8 w-full py-4">
              {navLinks.map((link, i) => {
                // LOGOUT is a button, not a link
                if (link.label === "LOGOUT") {
                  return (
                    <motion.div
                      custom={i}
                      variants={itemVariants}
                      key="LOGOUT"
                      className="overflow-hidden"
                    >
                      <button
                        onClick={handleLogout}
                        className="group relative inline-flex items-center text-left"
                      >
                        <span className="font-main text-3xl md:text-4xl lg:text-5xl uppercase leading-none tracking-tight transition-colors duration-500 text-white/20 group-hover:text-red-400">
                          LOGOUT
                        </span>
                        <span className="absolute -left-6 md:-left-10 h-[4px] w-[0px] bg-red-400 top-1/2 -translate-y-1/2 transition-all duration-300 group-hover:w-[12px] md:group-hover:w-[20px]" />
                      </button>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    custom={i}
                    variants={itemVariants}
                    key={link.label}
                    className="overflow-hidden"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="group relative inline-flex items-center"
                    >
                      <span
                        className={`font-main text-3xl md:text-4xl lg:text-5xl uppercase leading-none tracking-tight transition-colors duration-500
                          ${pathname === link.href
                            ? "text-white"
                            : link.label === "DASHBOARD"
                              ? "text-primary/80 group-hover:text-primary"
                              : "text-white/40 group-hover:text-white"
                          }
                        `}
                      >
                        {link.label}
                      </span>
                      <span className={`absolute -left-6 md:-left-10 h-[4px] w-[0px] ${link.label === "DASHBOARD" ? "bg-primary" : "bg-white"} top-1/2 -translate-y-1/2 transition-all duration-300 group-hover:w-[12px] md:group-hover:w-[20px]`} />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.div>
    </>
  );
}
