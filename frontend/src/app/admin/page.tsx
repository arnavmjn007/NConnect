"use client";
import React from 'react';
import {
    Users, ShieldCheck, FolderOpen, Package,
    DollarSign, Flag, Star, 
    Clock, CheckCircle, XCircle, AlertTriangle,
    ArrowUpRight, Activity
} from 'lucide-react';

interface StatCard {
    label: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    Icon: React.ElementType;
    color: string;
}

const STATS: StatCard[] = [
    { label: "Total Users", value: "1,240", change: "+12%", trend: "up", Icon: Users, color: "text-blue-400" },
    { label: "Total NGOs", value: "48", change: "+3", trend: "up", Icon: ShieldCheck, color: "text-indigo-400" },
    { label: "Pending Verifications", value: "7", change: "Action needed", trend: "neutral", Icon: Clock, color: "text-amber-400" },
    { label: "Active Projects", value: "124", change: "+8%", trend: "up", Icon: FolderOpen, color: "text-emerald-400" },
    { label: "Total Donations", value: "NPR 2.4M", change: "+18%", trend: "up", Icon: DollarSign, color: "text-rose-400" },
    { label: "Resources Listed", value: "89", change: "+5", trend: "up", Icon: Package, color: "text-cyan-400" },
    { label: "Open Reports", value: "14", change: "Needs review", trend: "neutral", Icon: Flag, color: "text-orange-400" },
    { label: "Premium NGOs", value: "12", change: "+1", trend: "up", Icon: Star, color: "text-yellow-400" },
];

const RECENT_ACTIONS = [
    { action: "NGO Verification Approved", target: "Hope Foundation Nepal", time: "2 min ago", type: "approve" },
    { action: "User Suspended", target: "john_doe_123", time: "15 min ago", type: "suspend" },
    { action: "Report Resolved", target: "Post #4521", time: "1 hr ago", type: "resolve" },
    { action: "NGO Verification Rejected", target: "Fake NGO Ltd.", time: "2 hr ago", type: "reject" },
    { action: "Announcement Sent", target: "All Users", time: "3 hr ago", type: "announce" },
    { action: "Project Flagged", target: "Suspicious Water Project", time: "5 hr ago", type: "flag" },
];

const PENDING_VERIFICATIONS = [
    { name: "Green Earth Nepal", submitted: "2 days ago", docs: true },
    { name: "Child Care Initiative", submitted: "3 days ago", docs: true },
    { name: "Rural Health Access", submitted: "5 days ago", docs: false },
];

const ACTION_STYLE: Record<string, string> = {
    approve: "text-emerald-400 bg-emerald-400/10",
    suspend: "text-orange-400 bg-orange-400/10",
    resolve: "text-blue-400 bg-blue-400/10",
    reject: "text-red-400 bg-red-400/10",
    announce: "text-indigo-400 bg-indigo-400/10",
    flag: "text-amber-400 bg-amber-400/10",
};

const ACTION_ICON: Record<string, React.ElementType> = {
    approve: CheckCircle,
    suspend: XCircle,
    resolve: CheckCircle,
    reject: XCircle,
    announce: Activity,
    flag: AlertTriangle,
};

export default function AdminDashboard() {
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
                {STATS.map(({ label, value, change, trend, Icon, color }) => (
                    <div key={label} className="bg-[#0D0E14] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center bg-white/5`}>
                                <Icon size={15} className={color} />
                            </div>
                            {trend === "up" && <ArrowUpRight size={13} className="text-emerald-400" />}
                            {trend === "neutral" && <AlertTriangle size={13} className="text-amber-400" />}
                        </div>
                        <p className="text-white text-xl font-black">{value}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                        {change && (
                            <p className={`text-[10px] font-semibold mt-1.5 ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-amber-400"}`}>
                                {change}
                            </p>
                        )}
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
                        {RECENT_ACTIONS.map((a, i) => {
                            const Icon = ACTION_ICON[a.type];
                            return (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${ACTION_STYLE[a.type]}`}>
                                        <Icon size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-200 text-xs font-semibold truncate">{a.action}</p>
                                        <p className="text-slate-500 text-[11px] truncate">{a.target}</p>
                                    </div>
                                    <span className="text-slate-600 text-[10px] shrink-0">{a.time}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-sm font-bold">Pending Verifications</h2>
                        <span className="text-[10px] font-bold bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">
                            {PENDING_VERIFICATIONS.length} waiting
                        </span>
                    </div>
                    <div className="space-y-3">
                        {PENDING_VERIFICATIONS.map((v, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                <div className="h-8 w-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xs font-black text-indigo-400 shrink-0">
                                    {v.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 text-xs font-semibold truncate">{v.name}</p>
                                    <p className="text-slate-500 text-[10px]">Submitted {v.submitted}</p>
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