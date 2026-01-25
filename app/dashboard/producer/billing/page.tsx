"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Loader2, Edit2, MapPin, Globe } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { motion, AnimatePresence, useTransform, useMotionValue, useSpring } from "framer-motion";
import Loading from "@/app/components/general/loading";
import { cn } from "@/lib/utils";

interface BillingFormData {
    fullName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    vatId?: string;
}

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xl font-bold text-white mb-4 px-1">{title}</h3>
);

const InputRow: React.FC<{
    label: string,
    value: string | null | undefined,
    onChange: (value: string) => void,
    placeholder?: string,
    icon?: React.ReactNode,
    last?: boolean,
    isEditing: boolean
}> = ({ label, value, onChange, placeholder, icon, last, isEditing }) => (
    <div className={`flex items-center gap-4 py-4 px-4 bg-white/5 transition-colors ${!last ? 'border-b border-white/5' : ''}`}>
        <div className="w-8 flex items-center justify-center text-white/40">
            {icon}
        </div>
        <div className="flex-1 space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50">
                {label}
            </label>
            {isEditing ? (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-white/20 transition-all font-medium border border-white/5 focus:border-white/10"
                    />
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-9 flex items-center text-white font-medium text-sm">
                    {value || <span className="text-white/20 italic text-xs">Not set</span>}
                </motion.div>
            )}
        </div>
    </div>
);

export default function ProducerBillingPage() {
    const [billingForm, setBillingForm] = useState<BillingFormData>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const scrollY = useMotionValue(0);
    const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 10, mass: 0.5 });

    const headerScale = useTransform(smoothScrollY, [0, 80], [1, 0.6]);
    const headerY = useTransform(smoothScrollY, [0, 80], [0, -70]);

    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;

        const handleScroll = () => {
            scrollY.set(main.scrollTop);
        };

        main.addEventListener('scroll', handleScroll);
        return () => main.removeEventListener('scroll', handleScroll);
    }, [scrollY]);

    useEffect(() => {
        const fetchBilling = async () => {
            const profileRes = await authenticatedFetch("/api/producer/profile");
            if (profileRes.ok) {
                const data = await profileRes.json();
                setBillingForm(data.producer.billing || {});
            }
            setLoading(false);
        };
        fetchBilling();
    }, []);

    const handleSaveBilling = async () => {
        setSaving(true);
        try {
            const res = await authenticatedFetch("/api/producer/profile", {
                method: "PATCH",
                body: JSON.stringify({ billing: billingForm }),
            });
            if (res.ok) {
                // success
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
            setIsEditing(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full mx-auto pb-20"
        >
            <div className="flex items-center justify-between mb-8 md:mb-12 sticky top-0 z-50 pt-24 py-4 border-b border-white/5 -mx-6 px-6 md:-mx-12 md:px-12 lg:-mx-0 lg:px-0  lg:border-none">
                <div className="w-[calc(100%+8rem)] absolute top-0 left-[-4rem] z-[-1] h-full [mask:linear-gradient(black,transparent)] backdrop-blur-xl"></div>
                <div className="flex items-center gap-4">
                    <motion.h2
                        className="font-main uppercase text-5xl md:text-7xl text-white origin-left"
                        style={{
                            scale: headerScale,
                            y: headerY,
                        }}
                    >
                        Billing
                    </motion.h2>
                </div>

                <motion.button
                    layout
                    onClick={() => isEditing ? handleSaveBilling() : setIsEditing(true)}
                    disabled={saving}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 active:scale-95 duration-200 rounded-full shadow-lg shadow-white/10 overflow-hidden",
                        isEditing ? "bg-white text-black hover:bg-primary" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                    initial={false}
                    style={{ y: headerY }}
                    animate={{
                        width: isEditing ? 160 : 140,
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.span
                                key="save"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center justify-center gap-2 w-full text-nowrap"
                            >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Save Changes
                            </motion.span>
                        ) : (
                            <motion.span
                                key="edit"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-center gap-2 w-full text-nowrap"
                            >
                                <Edit2 className="w-3 h-3" />
                                Edit billing
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            <div className="relative mb-12 group">
                {/* Background Gradient only, similar to profile but simplified as we don't have the hero section */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-20 rounded-[2.5rem]" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">

                    {/* Legal Entity Card */}
                    <div>
                        <SectionHeader title="Legal Entity" />
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                            <InputRow
                                label="Full Legal Name"
                                value={billingForm.fullName}
                                onChange={(v) => setBillingForm({ ...billingForm, fullName: v })}
                                icon={<CreditCard className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="VAT / Tax ID"
                                value={billingForm.vatId}
                                onChange={(v) => setBillingForm({ ...billingForm, vatId: v })}
                                placeholder="Optional"
                                icon={<CreditCard className="w-5 h-5 text-white/40" />}
                                last
                                isEditing={isEditing}
                            />
                        </div>
                    </div>

                    {/* Address Card */}
                    <div>
                        <SectionHeader title="Address" />
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                            <InputRow
                                label="Address Line 1"
                                value={billingForm.addressLine1}
                                onChange={(v) => setBillingForm({ ...billingForm, addressLine1: v })}
                                icon={<MapPin className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Address Line 2"
                                value={billingForm.addressLine2}
                                onChange={(v) => setBillingForm({ ...billingForm, addressLine2: v })}
                                placeholder="Apt, Suite, etc."
                                icon={<MapPin className="w-5 h-5 text-white/40" />}
                                isEditing={isEditing}
                            />
                            <div className="grid grid-cols-2">
                                <div className="border-r border-white/5">
                                    <InputRow
                                        label="City"
                                        value={billingForm.city}
                                        onChange={(v) => setBillingForm({ ...billingForm, city: v })}
                                        icon={<MapPin className="w-5 h-5 text-white/40" />}
                                        last
                                        isEditing={isEditing}
                                    />
                                </div>
                                <InputRow
                                    label="Postal Code"
                                    value={billingForm.postalCode}
                                    onChange={(v) => setBillingForm({ ...billingForm, postalCode: v })}
                                    icon={<Globe className="w-5 h-5" />}
                                    last
                                    isEditing={isEditing}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
