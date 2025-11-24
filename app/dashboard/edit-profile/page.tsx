"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import Loading from "@/app/components/general/loading";

interface UserData {
    id: string;
    name: string;
    surname: string | null;
    email: string;
    username: string;
    address: {
        street: string;
        city: string;
        state: string | null;
        postalCode: string;
        country: string;
    } | null;
}

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
    });

    useEffect(() => {
        const authUser = getAuthUser();
        if (!authUser) {
            router.push("/signin");
            return;
        }

        fetchUserData();
    }, [router]);

    const fetchUserData = async () => {
        try {
            const response = await fetch("/api/user/dashboard", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
            const user: UserData = data.user;

            setFormData({
                name: user.name || "",
                surname: user.surname || "",
                address: {
                    street: user.address?.street || "",
                    city: user.address?.city || "",
                    state: user.address?.state || "",
                    postalCode: user.address?.postalCode || "",
                    country: user.address?.country || "",
                },
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.surname.trim()) {
            newErrors.surname = "Surname is required";
        }

        // Validate address if any field is filled
        const hasAddressData = Object.values(formData.address).some((val) => val.trim());
        if (hasAddressData) {
            if (!formData.address.street.trim()) {
                newErrors.street = "Street is required";
            }
            if (!formData.address.city.trim()) {
                newErrors.city = "City is required";
            }
            if (!formData.address.postalCode.trim()) {
                newErrors.postalCode = "Postal code is required";
            }
            if (!formData.address.country.trim()) {
                newErrors.country = "Country is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setErrors({});
        setSuccessMessage("");

        try {
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.error || "Failed to update profile" });
                setSaving(false);
                return;
            }

            // Update user in localStorage
            const currentUser = getAuthUser();
            if (currentUser) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({ ...currentUser, ...data.user })
                );
            }

            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrors({ general: "An error occurred. Please try again." });
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-12 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="uppercase font-heading font-bold text-4xl mb-2 tracking-wide">
                        EDIT PROFILE
                    </h1>
                    <p className="text-white/60">Update your personal information</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-400 text-sm">{successMessage}</p>
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                    placeholder="Enter your name"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-xs mt-2">{errors.name}</p>
                                )}
                            </div>

                            {/* Surname */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                    Surname *
                                </label>
                                <input
                                    type="text"
                                    value={formData.surname}
                                    onChange={(e) =>
                                        setFormData({ ...formData, surname: e.target.value })
                                    }
                                    className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                    placeholder="Enter your surname"
                                />
                                {errors.surname && (
                                    <p className="text-red-400 text-xs mt-2">{errors.surname}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-6">Address</h2>

                        <div className="space-y-6">
                            {/* Street */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address.street}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address, street: e.target.value },
                                        })
                                    }
                                    className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                    placeholder="123 Main Street"
                                />
                                {errors.street && (
                                    <p className="text-red-400 text-xs mt-2">{errors.street}</p>
                                )}
                            </div>

                            {/* City & State */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value },
                                            })
                                        }
                                        className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                        placeholder="City"
                                    />
                                    {errors.city && (
                                        <p className="text-red-400 text-xs mt-2">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value },
                                            })
                                        }
                                        className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            {/* Postal Code & Country */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.postalCode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: { ...formData.address, postalCode: e.target.value },
                                            })
                                        }
                                        className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                        placeholder="12345"
                                    />
                                    {errors.postalCode && (
                                        <p className="text-red-400 text-xs mt-2">{errors.postalCode}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.country}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: { ...formData.address, country: e.target.value },
                                            })
                                        }
                                        className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                                        placeholder="United States"
                                    />
                                    {errors.country && (
                                        <p className="text-red-400 text-xs mt-2">{errors.country}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 text-lg tracking-wide transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-4 text-lg tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}