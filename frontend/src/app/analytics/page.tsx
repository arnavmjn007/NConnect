"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    DollarSign, Users, Heart, FolderOpen,
    Zap, Crown, CheckCircle, ArrowRight, X,
    Smartphone, CreditCard, AlertTriangle,
    TrendingUp, Activity, Trophy, Target, Download, Loader2
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import EsewaPaymentForm from '@/components/payment/EsewaPaymentForm';
import StripePaymentForm from '@/components/payment/StripePaymentForm';

interface NgoStats {
    totalDonations: number;
    totalVolunteers: number;
    totalFollowers: number;
    projectCount: number;
}

interface TrendPoint {
    month: string;
    amount?: number;
    count?: number;
}

interface VolunteerPerformance {
    userId: string;
    name: string;
    score: number;
}

interface ProjectSuccessScore {
    projectId: string;
    title: string;
    score: number;
}

interface ProAnalytics {
    donationTrend: TrendPoint[];
    volunteerActivityTrend: TrendPoint[];
    volunteerPerformance: VolunteerPerformance[];
    projectSuccessScores: ProjectSuccessScore[];
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                            <Crown size={15} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">Upgrade to Pro</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {step === 1 && (
                        <>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">Choose your plan</p>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button onClick={() => setPlan("MONTHLY")}
                                        className={`p-3.5 rounded-xl border text-left transition-colors ${plan === "MONTHLY" ? "border-[#0A66C2] bg-blue-50/60 ring-1 ring-[#0A66C2]" : "border-slate-200 hover:border-slate-300"}`}>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Monthly</p>
                                        <p className="text-lg font-bold text-slate-900 mt-0.5">NPR 499</p>
                                        <p className="text-[11px] text-slate-400">billed monthly</p>
                                    </button>
                                    <button onClick={() => setPlan("YEARLY")}
                                        className={`p-3.5 rounded-xl border text-left transition-colors relative ${plan === "YEARLY" ? "border-[#0A66C2] bg-blue-50/60 ring-1 ring-[#0A66C2]" : "border-slate-200 hover:border-slate-300"}`}>
                                        <span className="absolute -top-2 right-3 text-[9px] font-semibold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                                            Save 17%
                                        </span>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Yearly</p>
                                        <p className="text-lg font-bold text-slate-900 mt-0.5">NPR 4,999</p>
                                        <p className="text-[11px] text-slate-400">billed annually</p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">Payment method</p>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button onClick={() => setPaymentMethod("ESEWA")}
                                        className={`p-3 rounded-xl border text-left transition-colors ${paymentMethod === "ESEWA" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={14} className={paymentMethod === "ESEWA" ? "text-emerald-600" : "text-slate-400"} />
                                            <span className="text-xs font-semibold text-slate-900">eSewa</span>
                                        </div>
                                    </button>
                                    <button onClick={() => setPaymentMethod("STRIPE")}
                                        className={`p-3 rounded-xl border text-left transition-colors ${paymentMethod === "STRIPE" ? "border-[#0A66C2] bg-blue-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className={paymentMethod === "STRIPE" ? "text-[#0A66C2]" : "text-slate-400"} />
                                            <span className="text-xs font-semibold text-slate-900">Card</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 text-red-500 text-xs">
                                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />{error}
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
                                    className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-2.5 sm:py-3 rounded-xl text-sm transition-colors active:scale-[0.99]">
                                    Continue to card payment →
                                </button>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-2 gap-2">
                                <span className="text-sm text-slate-600">{plan === "MONTHLY" ? "Monthly" : "Yearly"} Pro</span>
                                <span className="font-semibold text-[#0A66C2]">NPR {amount.toLocaleString()}</span>
                            </div>
                            {error && (
                                <div className="flex items-start gap-2 text-red-500 text-xs mb-2">
                                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />{error}
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

function monthLabel(ym: string) {
    const [year, month] = ym.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'short' });
}

function ProAnalyticsSection({ dbUser }: { dbUser: { fullName?: string | null; id?: string | null } | null | undefined }) {
    const [data, setData] = useState<ProAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch('/api/ngo/analytics/pro');
                if (!res.ok) throw new Error("Failed to load Pro analytics");
                const json = await res.json();
                setData(json);
            } catch {
                setError("Couldn't load advanced analytics right now.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleExportPdf = async () => {
        if (!data) return;
        setExporting(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const marginX = 14;
            let y = 18;

            doc.setFontSize(16);
            doc.text("NConnect — NGO Analytics Report", marginX, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`${dbUser?.fullName || "NGO"} · Generated ${new Date().toLocaleDateString()}`, marginX, y);
            y += 10;
            doc.setTextColor(0);

            doc.setFontSize(12);
            doc.text("Donation Trend (last 6 months)", marginX, y);
            y += 7;
            doc.setFontSize(9);
            data.donationTrend.forEach(p => {
                doc.text(`${monthLabel(p.month)}: NPR ${(p.amount ?? 0).toLocaleString()}`, marginX + 2, y);
                y += 5;
            });
            y += 5;

            doc.setFontSize(12);
            doc.text("Volunteer Activity Trend (last 6 months)", marginX, y);
            y += 7;
            doc.setFontSize(9);
            data.volunteerActivityTrend.forEach(p => {
                doc.text(`${monthLabel(p.month)}: ${p.count ?? 0} accepted volunteers`, marginX + 2, y);
                y += 5;
            });
            y += 5;

            doc.setFontSize(12);
            doc.text("Top Volunteer Performance Scores", marginX, y);
            y += 7;
            doc.setFontSize(9);
            if (data.volunteerPerformance.length === 0) {
                doc.text("No volunteer data yet.", marginX + 2, y);
                y += 5;
            } else {
                data.volunteerPerformance.slice(0, 10).forEach((v, i) => {
                    doc.text(`${i + 1}. ${v.name} — ${v.score}/100`, marginX + 2, y);
                    y += 5;
                });
            }
            y += 5;

            doc.setFontSize(12);
            doc.text("Project Success Scores", marginX, y);
            y += 7;
            doc.setFontSize(9);
            if (data.projectSuccessScores.length === 0) {
                doc.text("No project data yet.", marginX + 2, y);
            } else {
                data.projectSuccessScores.forEach((p, i) => {
                    doc.text(`${i + 1}. ${p.title} — ${p.score}/100`, marginX + 2, y);
                    y += 5;
                });
            }

            doc.save(`nconnect-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-[#0A66C2] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-red-500">
                {error || "Advanced analytics unavailable."}
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-400" /> Advanced Analytics
                </h2>
                <button
                    onClick={handleExportPdf}
                    disabled={exporting}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0A66C2] hover:text-[#004182] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                >
                    {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                    <span className="hidden xs:inline">Export PDF</span>
                    <span className="xs:hidden">Export</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
                        <TrendingUp size={13} className="text-rose-500" /> Donation Trend
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data.donationTrend.map(p => ({ ...p, label: monthLabel(p.month) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip
                                formatter={(value) => [
                                    `NPR ${Number(value).toLocaleString()}`,
                                    "Donations",
                                ]}
                            />
                            <Line type="monotone" dataKey="amount" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
                        <Activity size={13} className="text-indigo-500" /> Volunteer Activity
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data.volunteerActivityTrend.map(p => ({ ...p, label: monthLabel(p.month) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip
                                formatter={(value) => [
                                    value,
                                    "Accepted Volunteers",
                                ]}
                            />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
                        <Trophy size={13} className="text-amber-500" /> Volunteer Performance (AI)
                    </p>
                    {data.volunteerPerformance.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No volunteer applications yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.volunteerPerformance.slice(0, 5).map((v, i) => (
                                <div key={v.userId} className="flex items-center justify-between gap-2 text-xs">
                                    <span className="text-slate-600 font-medium truncate">#{i + 1} {v.name}</span>
                                    <span className="font-semibold text-[#0A66C2] shrink-0">{v.score}/100</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
                        <Target size={13} className="text-emerald-500" /> Project Success Score (AI)
                    </p>
                    {data.projectSuccessScores.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No active projects yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.projectSuccessScores.slice(0, 5).map((p, i) => (
                                <div key={p.projectId} className="flex items-center justify-between gap-2 text-xs">
                                    <span className="text-slate-600 font-medium truncate">#{i + 1} {p.title}</span>
                                    <span className="font-semibold text-emerald-600 shrink-0">{p.score}/100</span>
                                </div>
                            ))}
                        </div>
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
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
                {proBannerMsg && (
                    <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-2.5 rounded-xl flex items-center justify-center gap-2 px-3">
                        <CheckCircle size={14} className="shrink-0" /> <span>{proBannerMsg}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                            Analytics
                            {isPro && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    <Crown size={10} /> Pro
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isPro ? "Full platform insights" : "Basic overview — upgrade for advanced insights"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 animate-pulse">
                                <div className="h-9 w-9 bg-slate-200 rounded-lg mb-3" />
                                <div className="h-6 w-20 bg-slate-200 rounded mb-1" />
                                <div className="h-3 w-28 bg-slate-100 rounded" />
                            </div>
                        ))
                    ) : STAT_CARDS.map(({ label, value, Icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                            <div className={`h-8 w-8 sm:h-9 sm:w-9 ${bg} rounded-lg flex items-center justify-center mb-2.5 sm:mb-3`}>
                                <Icon size={16} className={color} />
                            </div>
                            <p className={`text-lg sm:text-2xl font-bold ${color} truncate`}>{value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {isPro && <ProAnalyticsSection dbUser={dbUser} />}

                {!isPro && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-slate-100">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="h-8 w-8 bg-[#0A66C2] rounded-lg flex items-center justify-center shrink-0">
                                    <Crown size={15} className="text-white" />
                                </div>
                                <h2 className="font-semibold text-base sm:text-lg text-slate-900">Upgrade to Pro</h2>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Get advanced donor insights, volunteer performance tracking,
                                project impact reports, and priority listing on the platform.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="border border-slate-200 rounded-xl p-3.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Monthly</p>
                                    <p className="text-lg sm:text-xl font-bold text-slate-900">NPR 499</p>
                                    <p className="text-[11px] text-slate-400">per month</p>
                                </div>
                                <div className="border border-[#0A66C2] ring-1 ring-[#0A66C2] rounded-xl p-3.5 relative bg-blue-50/40">
                                    <span className="absolute -top-2 right-3 text-[9px] font-semibold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                                        Save 17%
                                    </span>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0A66C2] mb-1">Yearly</p>
                                    <p className="text-lg sm:text-xl font-bold text-slate-900">NPR 4,999</p>
                                    <p className="text-[11px] text-slate-500">per year</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[
                                    "Donation trend & volunteer activity charts",
                                    "AI volunteer performance scoring",
                                    "AI project success scoring",
                                    "Priority search listing",
                                    "Export reports as PDF",
                                ].map(f => (
                                    <div key={f} className="flex items-start gap-2 text-sm">
                                        <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span className="text-slate-600">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm px-5 py-2.5 sm:py-3 rounded-xl transition-colors active:scale-[0.99]"
                            >
                                <Zap size={15} />
                                Upgrade Now
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{isPro ? "Pro Plan" : "Free Plan"}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {isPro && dbUser?.proExpiresAt
                                ? `Renews / expires ${new Date(dbUser.proExpiresAt).toLocaleDateString()}`
                                : "NPR 0 · Basic analytics only"}
                        </p>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full shrink-0">
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