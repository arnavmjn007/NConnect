"use client";
import React from 'react';
import {
    MapPin,
    Mail,
    Calendar,
    BarChart2,
    Users2,
    ArrowUpRight,
    Bookmark,
    Sparkles
} from "lucide-react";

const user = {
    name: "Arnav Maharjan",
    role: "volunteer", // change to "ngo" to see NGO view
    location: "Kathmandu, Bagmati",
    email: "arnav@nconnect.org",
    joinedDate: "January 2025",
    stats: {
        following: 4,
        applications: 3,
        donations: 3
    }
};

const StatItem = ({
    value,
    label,
    color,
    border = false
}: {
    value: number;
    label: string;
    color: string;
    border?: boolean;
}) => (
    <div className={`flex-1 text-center py-2 cursor-pointer group transition-colors hover:bg-slate-50 rounded-lg ${border ? "border-x border-slate-100" : ""}`}>
        <p className={`${color} font-bold text-xl leading-none tabular-nums`}>{value}</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{label}</p>
    </div>
);

export default function Sidebar() {
    const isNGO = user.role === "ngo";
    return (
        <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-[#0A66C2] via-[#0073b1] to-[#00a0dc]" />
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                             radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                            backgroundSize: "24px 24px"
                        }}
                    />
                </div>
                <div className="px-4 pb-4">
                    <div className="relative -mt-8 mb-3 flex justify-start">
                        <div className="h-16 w-16 bg-white p-1 rounded-xl border border-slate-100 shadow-md">
                            <div className="h-full w-full bg-linear-to-br from-[#0A66C2] to-[#004182] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                        {isNGO && (
                            <span className="absolute -bottom-1 -right-1 bg-[#0A66C2] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-widest uppercase">
                                NGO
                            </span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-bold text-base text-slate-900 leading-tight cursor-pointer transition-colors">
                            {user.name}
                        </h2>
                        <div className="space-y-1">
                            {[
                                { Icon: MapPin, text: user.location },
                                { Icon: Mail, text: user.email },
                                { Icon: Calendar, text: `Joined ${user.joinedDate}` },
                            ].map(({ Icon, text }) => (
                                <div key={text} className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <Icon size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex">
                        <StatItem value={user.stats.following} label="Following" color="text-[#0A66C2]" />
                        <StatItem value={user.stats.applications} label="Apps" color="text-emerald-600" border />
                        <StatItem value={user.stats.donations} label="Donated" color="text-violet-600" />
                    </div>
                </div>
            </div>
            {isNGO && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 pt-1 pb-0.5">Management</p>
                    {[
                        { Icon: BarChart2, label: "Analytics", badge: null },
                        { Icon: Users2, label: "Volunteers", badge: "12 new" },
                    ].map(({ Icon, label, badge }) => (
                        <button
                            key={label}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={16} className="text-[#0A66C2]" />
                                <span className="text-sm font-semibold text-slate-700">{label}</span>
                            </div>
                            {badge
                                ? <span className="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
                                : <ArrowUpRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                            }
                        </button>
                    ))}
                </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 pt-1 pb-0.5">Quick Access</p>
                {[
                    { Icon: Bookmark, label: "Saved Posts" },
                    { Icon: Sparkles, label: "Discover NGOs" },
                ].map(({ Icon, label }) => (
                    <button
                        key={label}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group"
                    >
                        <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}