"use client";
import React, { useState, useEffect } from 'react';
import {
    Users, ShieldCheck, FolderOpen, Package,
    DollarSign, Flag, Star,
    Clock, CheckCircle, XCircle, AlertTriangle,
    ArrowUpRight, Activity
} from 'lucide-react';

interface DashboardData {
    totalUsers?: number;
    totalNgos?: number;
    pendingVerifications?: number;
    activeProjects?: number;
    totalDonationsNpr?: number;
    totalResources?: number;
    openReports?: number;
    verifiedNgos?: number;
    recentActions?: { action: string; targetType: string; details: string; createdAt: string }[];
    pendingVerificationsList?: { name: string; submitted: string; docs: boolean }[];
}

const ACTION_STYLE: Record<string, string> = {
    APPROVE: "text-emerald-400 bg-emerald-400/10",
    SUSPEND: "text-orange-400 bg-orange-400/10",
    RESOLVE: "text-blue-400 bg-blue-400/10",
    REJECT: "text-red-400 bg-red-400/10",
    ANNOUNCE: "text-indigo-400 bg-indigo-400/10",
    FLAG: "text-amber-400 bg-amber-400/10",
    UPDATE: "text-blue-400 bg-blue-400/10",
    DELETE: "text-red-400 bg-red-400/10",
};

const ACTION_ICON: Record<string, React.ElementType> = {
    APPROVE: CheckCircle,
    SUSPEND: XCircle,
    RESOLVE: CheckCircle,
    REJECT: XCircle,
    ANNOUNCE: Activity,
    FLAG: AlertTriangle,
    UPDATE: Activity,
    DELETE: XCircle,
};

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then(r => r.ok ? r.json() : {})
            .then(setData)
            .catch(() => setData({}))
            .finally(() => setLoading(false));
    }, []);

    const STATS = [
        { label: "Total Users", value: data.totalUsers ?? 0, Icon: Users, color: "text-blue-400" },
        { label: "Total NGOs", value: data.totalNgos ?? 0, Icon: ShieldCheck, color: "text-indigo-400" },
        { label: "Pending Verifications", value: data.pendingVerifications ?? 0, Icon: Clock, color: "text-amber-400" },
        { label: "Active Projects", value: data.activeProjects ?? 0, Icon: FolderOpen, color: "text-emerald-400" },
        { label: "Total Donations", value: `NPR ${(data.totalDonationsNpr ?? 0).toLocaleString()}`, Icon: DollarSign, color: "text-rose-400" },
        { label: "Resources Listed", value: data.totalResources ?? 0, Icon: Package, color: "text-cyan-400" },
        { label: "Open Reports", value: data.openReports ?? 0, Icon: Flag, color: "text-orange-400" },
        { label: "Verified NGOs", value: data.verifiedNgos ?? 0, Icon: Star, color: "text-yellow-400" },
    ];

    const recentActions = data.recentActions ?? [];
    const pendingVerifications = data.pendingVerificationsList ?? [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-xl font-black tracking-tight">Platform Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-bold">All Systems Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map(({ label, value, Icon, color }) => (
                    <div key={label} className="bg-[#0D0E14] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/5">
                                <Icon size={15} className={color} />
                            </div>
                        </div>
                        {loading ? (
                            <div className="h-6 w-16 bg-white/5 rounded animate-pulse" />
                        ) : (
                            <p className="text-white text-xl font-black">{value}</p>
                        )}
                        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-[#0D0E14] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-sm font-bold">Recent Admin Activity</h2>
                        <Activity size={14} className="text-slate-500" />
                    </div>
                    <div className="space-y-2">
                        {loading ? (
                            [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)
                        ) : recentActions.length === 0 ? (
                            <p className="text-slate-600 text-sm py-8 text-center">No admin activity yet</p>
                        ) : recentActions.map((a, i) => {
                            const Icon = ACTION_ICON[a.action] || Activity;
                            return (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${ACTION_STYLE[a.action] || "text-slate-400 bg-white/5"}`}>
                                        <Icon size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-200 text-xs font-semibold truncate">{a.action} — {a.targetType}</p>
                                        <p className="text-slate-500 text-[11px] truncate">{a.details}</p>
                                    </div>
                                    <span className="text-slate-600 text-[10px] shrink-0">
                                        {new Date(a.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-sm font-bold">Pending Verifications</h2>
                        <span className="text-[10px] font-bold bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">
                            {pendingVerifications.length} waiting
                        </span>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)
                        ) : pendingVerifications.length === 0 ? (
                            <p className="text-slate-600 text-sm py-8 text-center">Nothing pending</p>
                        ) : pendingVerifications.map((v, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                <div className="h-8 w-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xs font-black text-indigo-400 shrink-0">
                                    {v.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 text-xs font-semibold truncate">{v.name}</p>
                                    <p className="text-slate-500 text-[10px]">
                                        Submitted {new Date(v.submitted).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${v.docs ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                                            {v.docs ? "Docs ✓" : "Docs missing"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a href="/admin/ngo-verification"
                        className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 text-xs font-semibold transition-colors">
                        Review All <ArrowUpRight size={11} />
                    </a>
                </div>
            </div>
        </div>
    );
}