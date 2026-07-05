"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    DollarSign, Users, Heart, FolderOpen,
    Zap, Crown, CheckCircle, ArrowRight, X,
    Smartphone, CreditCard, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import EsewaPaymentForm from '@/components/payment/EsewaPaymentForm';
import StripePaymentForm from '@/components/payment/StripePaymentForm';

interface NgoStats {
    totalDonations: number;
    totalVolunteers: number;
    totalFollowers: number;
    projectCount: number;
}

type Plan = "MONTHLY" | "YEARLY";
const PLAN_PRICES: Record<Plan, number> = { MONTHLY: 499, YEARLY: 4999 };

function UpgradeModal({
    onClose,
    onConfirmed,
}: {
    onClose: () => void;
    onConfirmed: () => void;
}) {
    const { dbUser } = useAuth();
    const [plan, setPlan] = useState<Plan>("MONTHLY");
    const [paymentMethod, setPaymentMethod] = useState<"ESEWA" | "STRIPE">("ESEWA");
    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState("");
    const [confirming, setConfirming] = useState(false);

    const amount = PLAN_PRICES[plan];

    const confirmSubscription = async (paymentRef: string, method: string) => {
        setConfirming(true);
        setError("");
        try {
            const res = await fetch("/api/subscription/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, amount, paymentRef, paymentMethod: method }),
            });
            if (!res.ok) throw new Error("Failed to confirm subscription");
            onConfirmed();
            onClose();
        } catch {
            setError("Payment succeeded but confirmation failed. Contact support if charged.");
        } finally {
            setConfirming(false);
        }
    };

    const handleEsewaInitiated = () => {
        sessionStorage.setItem("esewa_pro_plan", plan);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Crown size={16} className="text-[#0A66C2]" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">Upgrade to Pro</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setPlan("MONTHLY")}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${plan === "MONTHLY" ? "border-[#0A66C2] bg-blue-50/50" : "border-slate-200"}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly</p>
                                    <p className="text-lg font-black text-slate-900">NPR 499</p>
                                </button>
                                <button onClick={() => setPlan("YEARLY")}
                                    className={`p-3 rounded-xl border-2 text-left transition-all relative ${plan === "YEARLY" ? "border-[#0A66C2] bg-blue-50/50" : "border-slate-200"}`}>
                                    <span className="absolute -top-2 right-2 text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded-full uppercase">
                                        Save 17%
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Yearly</p>
                                    <p className="text-lg font-black text-slate-900">NPR 4,999</p>
                                </button>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-700 mb-2">Payment Method</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setPaymentMethod("ESEWA")}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === "ESEWA" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}>
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={14} className={paymentMethod === "ESEWA" ? "text-emerald-600" : "text-slate-400"} />
                                            <span className="text-xs font-bold text-slate-900">eSewa</span>
                                        </div>
                                    </button>
                                    <button onClick={() => setPaymentMethod("STRIPE")}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === "STRIPE" ? "border-[#0A66C2] bg-blue-50/50" : "border-slate-200"}`}>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className={paymentMethod === "STRIPE" ? "text-[#0A66C2]" : "text-slate-400"} />
                                            <span className="text-xs font-bold text-slate-900">Card</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-xs">
                                    <AlertTriangle size={13} />{error}
                                </div>
                            )}

                            {paymentMethod === "ESEWA" ? (
                                <EsewaPaymentForm
                                    amount={amount}
                                    userId={dbUser?.id || ""}
                                    purpose={`pro_subscription_${plan.toLowerCase()}`}
                                    onInitiated={handleEsewaInitiated}
                                />
                            ) : (
                                <button onClick={() => setStep(2)}
                                    className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-2.5 rounded-xl text-sm">
                                    Continue to Card Payment →
                                </button>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">{plan === "MONTHLY" ? "Monthly" : "Yearly"} Pro</span>
                                <span className="font-bold text-[#0A66C2]">NPR {amount.toLocaleString()}</span>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-xs mb-2">
                                    <AlertTriangle size={13} />{error}
                                </div>
                            )}
                            {confirming ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-slate-500 text-sm">
                                    <div className="animate-spin h-5 w-5 border-2 border-[#0A66C2] border-t-transparent rounded-full" />
                                    Confirming subscription...
                                </div>
                            ) : (
                                <StripePaymentForm
                                    amount={amount}
                                    onSuccess={(intentId) => confirmSubscription(intentId, "STRIPE")}
                                    onError={setError}
                                />
                            )}
                            <button onClick={() => setStep(1)}
                                className="w-full text-slate-500 text-sm font-medium py-1.5 hover:text-slate-800 transition-colors">
                                ← Back
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function AnalyticsContent() {
    const { dbUser, refreshUser } = useAuth();
    const searchParams = useSearchParams();
    const [stats, setStats] = useState<NgoStats>({
        totalDonations: 0,
        totalVolunteers: 0,
        totalFollowers: 0,
        projectCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [proBannerMsg, setProBannerMsg] = useState("");

    const isPro = !!dbUser?.pro;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [projRes, followRes] = await Promise.all([
                    fetch('/api/projects/my'),
                    fetch('/api/feed/followers/' + encodeURIComponent(dbUser?.id || '')),
                ]);
                const projects = projRes.ok ? await projRes.json() : [];
                const followers = followRes.ok ? await followRes.json() : [];

                const totalVols = projects.reduce((s: number, p: { volunteersJoined?: number }) =>
                    s + (p.volunteersJoined || 0), 0);
                const totalRaised = projects.reduce((s: number, p: { raisedAmount?: number }) =>
                    s + (p.raisedAmount || 0), 0);

                setStats({
                    totalDonations: totalRaised,
                    totalVolunteers: totalVols,
                    totalFollowers: Array.isArray(followers) ? followers.length : 0,
                    projectCount: projects.length,
                });
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        if (dbUser?.id) load();
    }, [dbUser?.id]);

    useEffect(() => {
        const payment = searchParams.get("payment");
        const encodedData = searchParams.get("data");
        if (payment === "success" && encodedData) {
            const plan = (sessionStorage.getItem("esewa_pro_plan") as Plan) || "MONTHLY";
            (async () => {
                try {
                    const res = await fetch("/api/payment/esewa/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ encodedData }),
                    });
                    const data = await res.json();
                    if (data.verified) {
                        await fetch("/api/subscription/confirm", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                plan,
                                amount: parseInt(data.amount) || PLAN_PRICES[plan],
                                paymentRef: data.ref,
                                paymentMethod: "ESEWA",
                            }),
                        });
                        await refreshUser();
                        setProBannerMsg("You're now on Pro! 🎉");
                    }
                } catch { /* silent */ }
                finally {
                    sessionStorage.removeItem("esewa_pro_plan");
                    sessionStorage.removeItem("esewa_amt");
                    sessionStorage.removeItem("esewa_transaction_uuid");
                }
            })();
        }
    }, [searchParams, refreshUser]);

    const STAT_CARDS = [
        { label: "Total Donations", value: `NPR ${stats.totalDonations.toLocaleString()}`, Icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Total Volunteers", value: stats.totalVolunteers, Icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Followers", value: stats.totalFollowers, Icon: Heart, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Active Projects", value: stats.projectCount, Icon: FolderOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                {proBannerMsg && (
                    <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-2.5 rounded-xl flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> {proBannerMsg}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Analytics
                            {isPro && (
                                <span className="flex items-center gap-1 text-[10px] font-black bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    <Crown size={10} /> Pro
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isPro ? "Full platform insights" : "Basic overview — upgrade for advanced insights"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse">
                                <div className="h-9 w-9 bg-slate-200 rounded-xl mb-3" />
                                <div className="h-6 w-20 bg-slate-200 rounded mb-1" />
                                <div className="h-3 w-28 bg-slate-100 rounded" />
                            </div>
                        ))
                    ) : STAT_CARDS.map(({ label, value, Icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className={`h-9 w-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={18} className={color} />
                            </div>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {!isPro && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-linear-to-br from-[#0A66C2] to-[#004182] p-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown size={18} className="text-amber-300" />
                                <h2 className="font-bold text-lg">Upgrade to Pro</h2>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Get advanced donor insights, volunteer performance tracking,
                                project impact reports, and priority listing on the platform.
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="border border-slate-200 rounded-xl p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly</p>
                                    <p className="text-xl font-black text-slate-900">NPR 499</p>
                                    <p className="text-[11px] text-slate-400">per month</p>
                                </div>
                                <div className="border-2 border-[#0A66C2] rounded-xl p-3 relative bg-blue-50/40">
                                    <span className="absolute -top-2 right-2 text-[9px] font-black bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase">
                                        Save 17%
                                    </span>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#0A66C2] mb-1">Yearly</p>
                                    <p className="text-xl font-black text-slate-900">NPR 4,999</p>
                                    <p className="text-[11px] text-slate-500">per year</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[
                                    "Donor breakdown & retention analytics",
                                    "Volunteer performance reports",
                                    "Project impact visualizations",
                                    "Priority search listing",
                                    "Advanced notification targeting",
                                    "Export reports as PDF",
                                ].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-sm">
                                        <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                                        <span className="text-slate-600">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                            >
                                <Zap size={15} />
                                Upgrade Now
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-900">{isPro ? "Pro Plan" : "Free Plan"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isPro && dbUser?.proExpiresAt
                                ? `Renews / expires ${new Date(dbUser.proExpiresAt).toLocaleDateString()}`
                                : "NPR 0 · Basic analytics only"}
                        </p>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                        Current Plan
                    </span>
                </div>
            </div>

            {showUpgradeModal && (
                <UpgradeModal
                    onClose={() => setShowUpgradeModal(false)}
                    onConfirmed={() => {
                        refreshUser();
                        setProBannerMsg("You're now on Pro! 🎉");
                    }}
                />
            )}
        </div>
    );
}

export default function NgoAnalyticsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#0A66C2] border-t-transparent rounded-full" />
            </div>
        }>
            <AnalyticsContent />
        </Suspense>
    );
}