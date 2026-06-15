"use client";
import React, { useState, useEffect } from 'react';
import {
    DollarSign, Users, Heart, FolderOpen,
    Zap, Crown, CheckCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NgoStats {
    totalDonations: number;
    totalVolunteers: number;
    totalFollowers: number;
    projectCount: number;
}

export default function NgoAnalyticsPage() {
    const { dbUser } = useAuth();
    const [stats, setStats] = useState<NgoStats>({
        totalDonations: 0,
        totalVolunteers: 0,
        totalFollowers: 0,
        projectCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const isPremium = false;

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

    const STAT_CARDS = [
        { label: "Total Donations", value: `NPR ${stats.totalDonations.toLocaleString()}`, Icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Total Volunteers", value: stats.totalVolunteers, Icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Followers", value: stats.totalFollowers, Icon: Heart, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Active Projects", value: stats.projectCount, Icon: FolderOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Analytics
                            {isPremium && (
                                <span className="flex items-center gap-1 text-[10px] font-black bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    <Crown size={10} /> Pro
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isPremium ? "Full platform insights" : "Basic overview — upgrade for advanced insights"}
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

                {!isPremium && (
                    <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown size={18} className="text-amber-300" />
                                    <h2 className="font-bold text-lg">Upgrade to Pro</h2>
                                </div>
                                <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                                    Get advanced donor insights, volunteer performance tracking,
                                    project impact reports, and priority listing on the platform.
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">Monthly</p>
                                        <p className="text-xl font-black">NPR 499</p>
                                        <p className="text-[11px] text-indigo-200">per month</p>
                                    </div>
                                    <div className="bg-white/10 border border-amber-300/40 rounded-xl p-3 relative">
                                        <span className="absolute -top-2 right-2 text-[9px] font-black bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase">
                                            Save 17%
                                        </span>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">Yearly</p>
                                        <p className="text-xl font-black">NPR 4,999</p>
                                        <p className="text-[11px] text-indigo-200">per year</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-5">
                                    {[
                                        "Donor breakdown & retention analytics",
                                        "Volunteer performance reports",
                                        "Project impact visualizations",
                                        "Priority search listing",
                                        "Advanced notification targeting",
                                        "Export reports as PDF",
                                    ].map(f => (
                                        <div key={f} className="flex items-center gap-2 text-sm">
                                            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                            <span className="text-indigo-100">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
                                    <Zap size={15} />
                                    Upgrade Now
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isPremium && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Free Plan</p>
                            <p className="text-xs text-slate-400 mt-0.5">NPR 0 · Basic analytics only</p>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                            Current Plan
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}