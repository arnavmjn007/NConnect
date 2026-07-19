"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MapPin, Calendar, BarChart2, Users2,
    ArrowUpRight, Crown, DollarSign,
    Package, ChevronDown, ChevronRight,
    Building2, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const StatItem = ({ value, label, color, border = false }: {
    value: number | string; label: string; color: string; border?: boolean;
}) => {
    const isLong = typeof value === "string" && value.length > 5;
    return (
        <div className={`flex-1 flex flex-col items-center justify-center text-center py-1.5 sm:py-2 min-h-13 cursor-pointer group transition-colors hover:bg-slate-50 rounded-lg ${border ? "border-x border-slate-100" : ""}`}>
            <p className={`${color} font-bold leading-none tabular-nums whitespace-nowrap ${isLong ? "text-sm sm:text-base" : "text-lg sm:text-xl"}`}>
                {value}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
                {label}
            </p>
        </div>
    );
};

function formatCompactAmount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    return n.toString();
}

async function fetchCounts(
    sub: string,
    setFollowerCount: (n: number) => void,
    setFollowingCount: (n: number) => void
) {
    try {
        const res = await fetch(`/api/follow/${encodeURIComponent(sub)}/counts`);
        if (!res.ok) return;
        const data = await res.json();
        setFollowerCount(data.followerCount ?? 0);
        setFollowingCount(data.followingCount ?? 0);
    } catch { /* silent */ }
}

interface DonationRecord {
    amount: number;
    purpose: string;
    status: string;
}

async function fetchTotalDonated(setTotalDonated: (n: number) => void) {
    try {
        const res = await fetch('/api/user/my-donations');
        if (!res.ok) return;
        const records: DonationRecord[] = await res.json();
        const total = records
            .filter(r => r.status === "COMPLETED" && r.purpose?.startsWith("project_donation:"))
            .reduce((sum, r) => sum + (r.amount || 0), 0);
        setTotalDonated(total);
    } catch { /* silent */ }
}

export default function Sidebar() {
    const { dbUser, user } = useAuth();
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [totalDonated, setTotalDonated] = useState(0);
    const [contributionsOpen, setContributionsOpen] = useState(false);

    const isNGO = dbUser?.role === "NGO";
    const displayName = isNGO
        ? (dbUser?.organizationName || dbUser?.username || "Organization")
        : (dbUser?.fullName || user?.name || "User");
    const displayLocation = dbUser?.location || "Location not set";
    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const initial = displayName.charAt(0).toUpperCase();
    const isPremium = dbUser?.pro || false;

    const joinedDate = dbUser?.createdAt
        ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'June 2026';

    useEffect(() => {
        if (!user?.sub) return;
        fetchCounts(user.sub, setFollowerCount, setFollowingCount);
    }, [user?.sub]);

    useEffect(() => {
        if (!user?.sub) return;
        fetchTotalDonated(setTotalDonated);
    }, [user?.sub]);

    useEffect(() => {
        if (!user?.sub) return;
        const sub = user.sub;
        const handler = () => fetchCounts(sub, setFollowerCount, setFollowingCount);
        window.addEventListener('follow-changed', handler);
        return () => window.removeEventListener('follow-changed', handler);
    }, [user?.sub]);

    useEffect(() => {
        if (!user?.sub) return;
        const handler = () => fetchTotalDonated(setTotalDonated);
        window.addEventListener('donation-completed', handler);
        return () => window.removeEventListener('donation-completed', handler);
    }, [user?.sub]);

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-14 sm:h-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA]" />
                </div>
                <div className="px-3 sm:px-4 pb-4">
                    <div className="relative -mt-7 sm:-mt-8 mb-3 flex justify-start">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white p-1 rounded-xl border border-slate-100 shadow-md overflow-hidden">
                            {displayImage ? (
                                <Image
                                    src={displayImage}
                                    alt={displayName}
                                    width={60}
                                    height={60}
                                    className="h-full w-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="h-full w-full bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                                    {initial}
                                </div>
                            )}
                        </div>
                        {isNGO && (
                            <span className="absolute -bottom-1 right-0 bg-[#0A66C2] text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-widest uppercase">
                                NGO
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Link href="/profile">
                            <h2 className="font-bold text-sm sm:text-base text-slate-900 leading-tight hover:text-[#0A66C2] transition-colors cursor-pointer flex items-center gap-1.5 truncate">
                                {displayName}
                                {dbUser?.verified && (
                                    <span title="Verified NGO" className="shrink-0">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="8" fill="#0A66C2" />
                                            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </h2>
                        </Link>
                        {dbUser?.username && (
                            <p className="text-xs text-slate-400 truncate">@{dbUser.username}</p>
                        )}
                        {dbUser?.occupation && (
                            <p className="text-xs text-slate-500 font-medium truncate">{dbUser.occupation}</p>
                        )}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                <span className="truncate">{displayLocation}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <Calendar size={12} className="shrink-0 text-slate-400" />
                                <span>Joined {joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex">
                        <StatItem value={followingCount} label="Following" color="text-[#0A66C2]" />
                        <StatItem value={followerCount} label="Followers" color="text-emerald-600" border />
                        <StatItem value={`NPR ${formatCompactAmount(totalDonated)}`} label="Donated" color="text-violet-600" />
                    </div>
                </div>
            </div>

            {isNGO && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 sm:px-3 pt-1 pb-0.5">
                        Management
                    </p>

                    <Link href="/analytics"
                        className="w-full flex items-center justify-between gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <BarChart2 size={16} className="text-[#0A66C2] shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">Analytics</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {isPremium ? (
                                <span className="flex items-center gap-0.5 text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded-full uppercase">
                                    <Crown size={8} /> Pro
                                </span>
                            ) : (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase">
                                    Free
                                </span>
                            )}
                            <ArrowUpRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                    </Link>

                    <Link href="/project?view=my"
                        className="w-full flex items-center justify-between gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <Users2 size={16} className="text-[#0A66C2] shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">Volunteers</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#0A66C2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                            Manage
                        </span>
                    </Link>
                </div>
            )}

            {!isNGO && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 sm:px-3 pt-1 pb-0.5">
                        Quick Access
                    </p>
                    <div>
                        <button
                            onClick={() => setContributionsOpen(p => !p)}
                            className="w-full flex items-center justify-between gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <Sparkles size={16} className="text-indigo-500 shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">My Contributions</span>
                            </div>
                            {contributionsOpen
                                ? <ChevronDown size={14} className="text-slate-400 shrink-0" />
                                : <ChevronRight size={14} className="text-slate-400 shrink-0" />
                            }
                        </button>

                        {contributionsOpen && (
                            <div className="ml-3 sm:ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-2.5 sm:pl-3">
                                {[
                                    { Icon: DollarSign, label: "Money Donations", href: "/contributions?tab=donations" },
                                    { Icon: Package, label: "Resource Donations", href: "/contributions?tab=resources" },
                                    { Icon: Users2, label: "Volunteer Activities", href: "/contributions?tab=volunteer" },
                                ].map(({ Icon, label, href }) => (
                                    <Link key={label} href={href}
                                        className="w-full flex items-center gap-2.5 sm:gap-3 px-2 sm:px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors group">
                                        <Icon size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                                            {label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link href="/discover-ngos"
                        className="w-full flex items-center gap-2.5 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                        <Building2 size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                            Discover NGOs
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
}