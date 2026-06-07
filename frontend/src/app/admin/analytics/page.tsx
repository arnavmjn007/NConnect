"use client";
import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, FolderOpen, Package, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(r => r.ok ? r.json() : {})
            .then(setStats)
            .catch(() => setStats({}))
            .finally(() => setLoading(false));
    }, []);

    const METRIC_CARDS = [
        { label: "Total Users", key: "totalUsers", Icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Total NGOs", key: "totalNgos", Icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-400/10" },
        { label: "Verified NGOs", key: "verifiedNgos", Icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Active Projects", key: "activeProjects", Icon: FolderOpen, color: "text-violet-400", bg: "bg-violet-400/10" },
        { label: "Total Resources", key: "totalResources", Icon: Package, color: "text-cyan-400", bg: "bg-cyan-400/10" },
        { label: "Total Donations (NPR)", key: "totalDonationsNpr", Icon: DollarSign, color: "text-rose-400", bg: "bg-rose-400/10" },
        { label: "Onboarded Users", key: "onboardedUsers", Icon: Activity, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Pending Verifications", key: "pendingVerifications", Icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-400/10" },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-white text-xl font-black">Platform Analytics</h1>
                <p className="text-slate-500 text-sm mt-0.5">Real-time platform health and growth metrics</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {METRIC_CARDS.map(({ label, key, Icon, color, bg }) => (
                    <div key={key} className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                        <div className={`h-9 w-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                            <Icon size={16} className={color} />
                        </div>
                        {loading ? (
                            <div className="h-7 w-16 bg-white/5 rounded animate-pulse mb-1" />
                        ) : (
                            <p className="text-white text-2xl font-black">
                                {key === "totalDonationsNpr"
                                    ? `${((stats[key] || 0) / 1000).toFixed(1)}K`
                                    : (stats[key] || 0).toLocaleString()}
                            </p>
                        )}
                        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5">
                    <h2 className="text-white text-sm font-bold mb-4">User Role Breakdown</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { label: "Regular Users", value: (stats.totalUsers || 0) - (stats.totalNgos || 0), color: "bg-blue-500" },
                                { label: "NGO Accounts", value: stats.totalNgos || 0, color: "bg-indigo-500" },
                                { label: "Verified NGOs", value: stats.verifiedNgos || 0, color: "bg-emerald-500" },
                            ].map(({ label, value, color }) => {
                                const total = stats.totalUsers || 1;
                                const pct = Math.round((value / total) * 100);
                                return (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-slate-400">{label}</span>
                                            <span className="text-slate-200 font-bold">{value} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5">
                    <h2 className="text-white text-sm font-bold mb-4">Platform Health</h2>
                    <div className="space-y-3">
                        {[
                            { label: "Onboarding Rate", value: stats.totalUsers ? Math.round(((stats.onboardedUsers || 0) / stats.totalUsers) * 100) : 0, color: "bg-emerald-500" },
                            { label: "NGO Verification Rate", value: stats.totalNgos ? Math.round(((stats.verifiedNgos || 0) / stats.totalNgos) * 100) : 0, color: "bg-indigo-500" },
                            { label: "Project Activation Rate", value: 78, color: "bg-violet-500" },
                        ].map(({ label, value, color }) => (
                            <div key={label}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-400">{label}</span>
                                    <span className="text-slate-200 font-bold">{value}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}