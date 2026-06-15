"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MapPin, Calendar, BarChart2, Users2,
    ArrowUpRight, Sparkles, DollarSign,
    Package, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const StatItem = ({ value, label, color, border = false }: {
    value: number; label: string; color: string; border?: boolean;
}) => (
    <div className={`flex-1 text-center py-2 cursor-pointer group transition-colors hover:bg-slate-50 rounded-lg ${border ? "border-x border-slate-100" : ""}`}>
        <p className={`${color} font-bold text-xl leading-none tabular-nums`}>{value}</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{label}</p>
    </div>
);

export default function Sidebar() {
    const { dbUser, user } = useAuth();
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const displayName = dbUser?.fullName || user?.name || "User";
    const displayLocation = dbUser?.location || "Location not set";
    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const isNGO = dbUser?.role === "NGO";
    const initial = displayName.charAt(0).toUpperCase();
    const isPremium = false;

    useEffect(() => {
        if (!user?.sub) return;
        const encodedId = encodeURIComponent(user.sub);
        Promise.all([
            fetch(`/api/feed/followers/${encodedId}`).then(r => r.ok ? r.json() : []),
            fetch(`/api/feed/following/${encodedId}`).then(r => r.ok ? r.json() : []),
        ]).then(([followers, following]) => {
            setFollowerCount(Array.isArray(followers) ? followers.length : 0);
            setFollowingCount(Array.isArray(following) ? following.length : 0);
        }).catch(() => { });
    }, [user?.sub]);

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA]" />
                </div>
                <div className="px-4 pb-4">
                    <div className="relative -mt-8 mb-3 flex justify-start">
                        <div className="h-16 w-16 bg-white p-1 rounded-xl border border-slate-100 shadow-md overflow-hidden">
                            {displayImage ? (
                                <Image src={displayImage} alt={displayName} width={60} height={60}
                                    className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <div className="h-full w-full bg-linear-to-br from-[#0A66C2] to-[#004182] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                    {initial}
                                </div>
                            )}
                        </div>
                        {isNGO && (
                            <span className="absolute -bottom-1 right-0 bg-[#0A66C2] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-widest uppercase">
                                NGO
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Link href="/profile">
                            <h2 className="font-bold text-base text-slate-900 leading-tight hover:text-[#0A66C2] transition-colors cursor-pointer flex items-center gap-1.5">
                                {displayName}
                                {dbUser?.verified && (
                                    <span title="Verified NGO">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="8" fill="#0A66C2" />
                                            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </h2>
                        </Link>
                        {dbUser?.username && <p className="text-xs text-slate-400">@{dbUser.username}</p>}
                        {dbUser?.occupation && <p className="text-xs text-slate-500 font-medium">{dbUser.occupation}</p>}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                <span className="truncate">{displayLocation}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <Calendar size={12} className="shrink-0 text-slate-400" />
                                <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex">
                        <StatItem value={followingCount} label="Following" color="text-[#0A66C2]" />
                        <StatItem value={followerCount} label="Followers" color="text-emerald-600" border />
                        <StatItem value={0} label="Donated" color="text-violet-600" />
                    </div>
                </div>
            </div>

            {isNGO && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 pt-1 pb-0.5">Management</p>

                    <Link href="/analytics"
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            <BarChart2 size={16} className="text-[#0A66C2]" />
                            <span className="text-sm font-semibold text-slate-700">Analytics</span>
                        </div>
                        <div className="flex items-center gap-1.5">
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

                    <button className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            <Users2 size={16} className="text-[#0A66C2]" />
                            <span className="text-sm font-semibold text-slate-700">Volunteers</span>
                        </div>
                        <span className="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0 new</span>
                    </button>
                </div>
            )}

            {!isNGO && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 pt-1 pb-0.5">My Contributions</p>

                    {[
                        { Icon: DollarSign, label: "Money Donations", href: "/contributions?tab=donations" },
                        { Icon: Package, label: "Resource Donations", href: "/contributions?tab=resources" },
                        { Icon: Users2, label: "Volunteer Activities", href: "/contributions?tab=volunteer" },
                    ].map(({ Icon, label, href }) => (
                        <Link key={label} href={href}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                            <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                        </Link>
                    ))}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link href="/search?q=ngo"
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                            <Sparkles size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Discover NGOs</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}