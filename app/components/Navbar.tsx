"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "SOUNDS", href: "/sounds" },
  { label: "BUNDLES", href: "/bundles" },
  { label: "CIRCLE", href: "/community" },
  { label: "MUSIC", href: "/music" },
  { label: "MERCH", href: "/merch" },
  { label: "LOGIN", href: "/signin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setHasToken(false);
    setMenuOpen(false);
    window.location.reload();
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
        className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-md border-b border-white/10 transition-colors duration-500 transform-gpu"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="font-main text-2xl uppercase tracking-wider text-white relative z-[110] drop-shadow-md"
          >
            <img src="https://ethereal-misc.s3.eu-west-1.amazonaws.com/Ethereal-Techno-Logo.png" alt="Ethereal Techno" width={140} height={30} />
          </Link>

          <div className="flex items-center gap-6 relative z-[110]">
            <button className="text-white hover:text-white/80 transition-colors p-2 drop-shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </button>
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
                if (link.label === "LOGIN" && hasToken) {
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
                        <span
                          className={`font-main text-3xl md:text-4xl lg:text-5xl uppercase leading-none tracking-tight transition-colors duration-500 text-white/40 group-hover:text-white`}
                        >
                          LOGOUT
                        </span>
                        <span className="absolute -left-6 md:-left-10 h-[4px] w-[0px] bg-white top-1/2 -translate-y-1/2 transition-all duration-300 group-hover:w-[12px] md:group-hover:w-[20px]" />
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
                            : "text-white/40 group-hover:text-white"
                          }
                        `}
                      >
                        {link.label}
                      </span>
                      <span className="absolute -left-6 md:-left-10 h-[4px] w-[0px] bg-white top-1/2 -translate-y-1/2 transition-all duration-300 group-hover:w-[12px] md:group-hover:w-[20px]" />
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
