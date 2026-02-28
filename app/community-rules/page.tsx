import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Community Rules | Ethereal Techno",
    description: "Ethereal Techno – Community Rules & Membership Policy",
};

export default function CommunityRulesPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-24">
            <div className="max-w-3xl mx-auto px-6 pt-24 md:pt-32">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-sans uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Link>

                <div className="space-y-16">
                    <div>
                        <h1 className="font-main text-4xl md:text-6xl uppercase tracking-wide mb-4">
                            Ethereal Techno – Community Rules & Membership Policy
                        </h1>
                        <p className="text-white/50 font-sans tracking-wide text-sm uppercase">
                            Effective Date: January 1, 2026
                        </p>
                    </div>

                    <div className="space-y-12 text-white/80 font-light leading-relaxed">

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">1. Purpose of the Circle</h2>
                            <p>
                                The Ethereal Techno Circle is a curated community of producers aligned with a shared artistic vision. The goal is to protect quality, authenticity, and respectful collaboration. These rules apply to all users and are a condition of membership and platform access.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">2. Membership, Verification, and Discretion</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Verification is selective and granted at Ethereal Techno’s sole discretion.</li>
                                <li>Approval is not guaranteed; we may refuse applications without detailed justification.</li>
                                <li>Verification status may be downgraded, suspended, or revoked at any time for violation of these rules or where necessary to protect the integrity of the community.</li>
                                <li>Membership does not create employment, partnership, agency, or joint venture relationships.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">3. Conduct Standards</h2>
                            <p>Members must:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Treat others with respect and professionalism</li>
                                <li>Avoid harassment, hate speech, discrimination, and abusive conduct</li>
                                <li>Avoid spam, mass promotions, and unsolicited advertising</li>
                                <li>Respect artistic boundaries and collaboration etiquette</li>
                            </ul>
                            <p>We may issue warnings, restrict features, or remove members depending on severity.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">4. Messaging and Contact Rules</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Only Verified Members may contact other Verified Members (where enabled).</li>
                                <li>Do not spam, solicit, harass, or pressure others.</li>
                                <li>Do not attempt to collect or distribute personal data of other members.</li>
                                <li>Report abuse via support@etherealtechno.com.</li>
                            </ul>
                            <p>Misuse of messaging may result in immediate revocation of messaging privileges or membership.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">5. Telegram Community Guidelines</h2>
                            <p>The private Ethereal Techno Telegram group is an extension of the Circle and is subject to these rules.</p>
                            <p>Members must:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Communicate respectfully and professionally</li>
                                <li>Avoid spam, self-promotion, mass messaging, or unsolicited links</li>
                                <li>Avoid offensive, abusive, discriminatory, or disruptive behavior</li>
                                <li>Respect member privacy and do not share internal discussions, screenshots, or content outside the group without permission</li>
                            </ul>
                            <p>Admins may remove messages, restrict access, or remove members from the Telegram group at their sole discretion.</p>
                            <p>Serious or repeated violations may result in full membership revocation.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">6. Profile Integrity and Public Visibility</h2>
                            <p>
                                Members must maintain truthful profiles and links. Impersonation, misleading claims, or fraudulent representations may result in immediate removal.
                            </p>
                            <p>
                                If you enable public visibility, you acknowledge your profile may be publicly accessible and indexed by search engines. You may change visibility at any time in your dashboard.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">7. Intellectual Property and Content Responsibility</h2>
                            <p>
                                You must only submit content you own or have permission to use. This includes photos, audio, text, and links.
                            </p>
                            <p>
                                Ethereal Techno may remove content suspected of infringement or policy violations. Members remain responsible for their own submissions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">8. Optional Contributions</h2>
                            <p>
                                From time to time, we may invite members to contribute to sample libraries, community initiatives, or curated projects.
                            </p>
                            <p>
                                Participation is always optional. Any compensation, licensing, or usage rights will be governed by separate written agreements where applicable.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">9. Enforcement, Suspension, and Membership Revocation</h2>
                            <p>
                                Admins reserve the right, at their sole discretion, to suspend, restrict, or permanently revoke membership for any violation of these rules, misuse of platform features, behavior that harms other members, or actions deemed inconsistent with the Ethereal Techno philosophy.
                            </p>
                            <p>Revocation may occur without prior notice in serious cases.</p>
                            <p>
                                Revoked members may immediately lose access to Telegram groups, messaging privileges, discounts, dashboard features, and any member-only benefits.
                            </p>
                            <p>No compensation, refund, or damages shall be owed as a result of suspension or revocation.</p>
                            <p>Re-application may be possible after review, solely at our discretion.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">10. Updates</h2>
                            <p>
                                We may update these rules as the community evolves. Continued participation in the Circle constitutes acceptance of the latest version.
                            </p>
                        </section>

                        <section className="space-y-4 pt-8 border-t border-white/10">
                            <h2 className="font-main text-2xl uppercase tracking-wide text-white">11. Contact</h2>
                            <div className="space-y-2">
                                <p className="text-white/50 text-sm uppercase tracking-widest font-sans">Operator / Controller</p>
                                <p>Ethereal Techno is operated by<br />Christian Legno (sole proprietor / Selbständiger), Germany.</p>
                                <p>Contact: <a href="mailto:support@etherealtechno.com" className="text-white hover:text-primary transition-colors">support@etherealtechno.com</a></p>
                                <p>Business Address: Dottistr. 7, 10367 Berlin, Germany</p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    );
}
