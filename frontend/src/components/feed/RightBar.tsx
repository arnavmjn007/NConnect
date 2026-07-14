"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, BadgeCheck, CheckCircle } from 'lucide-react';
import SiteFooter from '../ui/SiteFooter';
import FollowButton from '../feed/FollowButton';
import { useAuth } from '@/hooks/useAuth';

interface NgoItem {
    id: string;
    auth0Id: string;
    username: string;
    organizationName: string;
    profileImageUrl: string;
    location: string;
    verified: boolean;
    ngoCategories: string;
}

interface ProjectItem {
    id: string;
    title: string;
    raisedAmount: number;
    goalAmount: number;
    status: string;
}

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
    const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    const goalReached = goal > 0 && raised >= goal;
    return (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ${goalReached ? 'bg-emerald-500' : 'bg-[#0A66C2]'}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

async function getFollowStates(ngoList: NgoItem[]): Promise<Record<string, boolean>> {
    const states: Record<string, boolean> = {};
    await Promise.all(
        ngoList.map(async (ngo) => {
            try {
                const res = await fetch(`/api/follow/${encodeURIComponent(ngo.auth0Id)}/counts`);
                if (res.ok) {
                    const data = await res.json();
                    states[ngo.auth0Id] = data.isFollowing ?? false;
                }
            } catch { /* silent */ }
        })
    );
    return states;
}

export default function RightBar() {
    const { user } = useAuth();
    const [ngos, setNgos] = useState<NgoItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [ngoLoading, setNgoLoading] = useState(true);

    useEffect(() => {
        if (!user?.sub) return;
        let cancelled = false;
        async function load() {
            try {
                const [ngoRes, projRes] = await Promise.all([
                    fetch('/api/users?role=NGO&limit=20'),
                    fetch('/api/projects?category=&search='),
                ]);
                if (!cancelled && ngoRes.ok) {
                    const data: NgoItem[] = await ngoRes.json();
                    const filtered = data.filter(n => n.auth0Id !== user?.sub);
                    const states = await getFollowStates(filtered);
                    if (!cancelled) {
                        const unFollowed = filtered
                            .filter(n => !states[n.auth0Id])
                            .slice(0, 4);
                        setNgos(unFollowed);
                    }
                }
                if (!cancelled && projRes.ok) {
                    const data: ProjectItem[] = await projRes.json();
                    const sorted = [...data]
                        .filter(p => p.goalAmount > 0)
                        .sort((a, b) => (b.raisedAmount / b.goalAmount) - (a.raisedAmount / a.goalAmount))
                        .slice(0, 3);
                    setProjects(sorted);
                }
            } catch { /* silent */ }
            finally { if (!cancelled) setNgoLoading(false); }
        }
        load();
        return () => { cancelled = true; };
    }, [user?.sub]);

    return (
        <div className="space-y-4 w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4 gap-2">
                    <h2 className="font-bold text-sm text-slate-900 tracking-tight truncate">Suggested NGOs</h2>
                    <Link href="/search?q=ngo" className="text-[10px] text-black font-semibold cursor-pointer hover:underline shrink-0">
                        See all
                    </Link>
                </div>

                {ngoLoading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 animate-pulse">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 bg-slate-200 rounded-xl shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="h-3 w-20 sm:w-24 bg-slate-200 rounded" />
                                        <div className="h-2.5 w-14 sm:w-16 bg-slate-100 rounded" />
                                    </div>
                                </div>
                                <div className="h-7 w-14 sm:w-16 bg-slate-200 rounded-full shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : ngos.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                        You&apos;re following all suggested NGOs!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {ngos.map((ngo) => (
                            <div key={ngo.id} className="flex items-center justify-between gap-2">
                                <Link href={`/profile/${ngo.username}`} className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden shrink-0 bg-indigo-100 flex items-center justify-center">
                                        {ngo.profileImageUrl ? (
                                            <Image
                                                src={ngo.profileImageUrl}
                                                alt={ngo.organizationName}
                                                width={36}
                                                height={36}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-indigo-700 font-bold text-sm">
                                                {ngo.organizationName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight truncate flex items-center gap-1">
                                            {ngo.organizationName}
                                            {ngo.verified && <BadgeCheck size={12} className="text-indigo-500 shrink-0" />}
                                        </h3>
                                        {ngo.location && (
                                            <p className="text-[11px] text-slate-400 truncate">{ngo.location}</p>
                                        )}
                                    </div>
                                </Link>
                                <FollowButton
                                    targetAuth0Id={ngo.auth0Id}
                                    initialFollowing={false}
                                    onFollowChange={(f) => {
                                        if (f) setNgos(prev => prev.filter(n => n.auth0Id !== ngo.auth0Id));
                                    }}
                                    size="sm"
                                    className="shrink-0"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {projects.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-indigo-600 shrink-0" />
                        <h2 className="font-bold text-sm text-slate-900">Trending Projects</h2>
                    </div>
                    <div className="space-y-5">
                        {projects.map((p) => {
                            const goalReached = p.raisedAmount >= p.goalAmount;
                            const pct = goalReached
                                ? 100
                                : p.goalAmount > 0
                                    ? Math.round((p.raisedAmount / p.goalAmount) * 100)
                                    : 0;
                            return (
                                <Link key={p.id} href={`/project/${p.id}`} className="block group cursor-pointer">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {p.title}
                                        </h3>
                                        {goalReached ? (
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                                                <CheckCircle size={9} /> Done
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-indigo-600 bg-[#EEF3F8] px-1.5 py-0.5 rounded-md shrink-0">
                                                {pct}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap justify-between gap-x-2 text-[11px] font-medium text-slate-400 mt-1">
                                        <span>NPR {p.raisedAmount.toLocaleString()} raised</span>
                                        <span>of NPR {p.goalAmount.toLocaleString()}</span>
                                    </div>
                                    <ProgressBar raised={p.raisedAmount} goal={p.goalAmount} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
            <SiteFooter />
        </div>
    );
}