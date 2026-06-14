import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, BadgeCheck } from 'lucide-react';
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

const ProgressBar = ({ raised, goal }: { raised: number; goal: number }) => {
    const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    return (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
                className="bg-linear-to-r from-[#0A66C2] to-[#0073b1] h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
};

export default function RightBar() {
    const { user } = useAuth();
    const [ngos, setNgos] = useState<NgoItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

    const fetchNgos = useCallback(async () => {
        try {
            const res = await fetch('/api/users?role=NGO&limit=4');
            if (res.ok) {
                const data: NgoItem[] = await res.json();
                setNgos(data);
            }
        } catch { /* silent */ }
    }, []);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/projects?category=&search=');
            if (res.ok) {
                const data: ProjectItem[] = await res.json();
                const sorted = [...data]
                    .filter(p => p.goalAmount > 0)
                    .sort((a, b) => {
                        const pctA = a.goalAmount ? a.raisedAmount / a.goalAmount : 0;
                        const pctB = b.goalAmount ? b.raisedAmount / b.goalAmount : 0;
                        return pctB - pctA;
                    })
                    .slice(0, 3);
                setProjects(sorted);
            }
        } catch { /* silent */ }
    }, []);

    const checkFollowStatus = useCallback(async (ngoList: NgoItem[]) => {
        if (!user?.sub || !ngoList.length) return;
        const states: Record<string, boolean> = {};
        await Promise.all(
            ngoList.map(async (ngo) => {
                try {
                    const res = await fetch(`/api/follow/${encodeURIComponent(ngo.auth0Id)}/counts`);
                    if (res.ok) {
                        const data = await res.json();
                        states[ngo.auth0Id] = data.isFollowing;
                    }
                } catch { /* silent */ }
            })
        );
        setFollowStates(states);
    }, [user?.sub]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!cancelled) {
                await fetchNgos();
                await fetchProjects();
            }
        };
        run();
        return () => { cancelled = true; };
    }, [fetchNgos, fetchProjects]);

    useEffect(() => {
        if (!ngos.length) return;
        let cancelled = false;
        const run = async () => {
            if (!cancelled) await checkFollowStatus(ngos);
        };
        run();
        return () => { cancelled = true; };
    }, [ngos, checkFollowStatus]);

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm text-slate-900 tracking-tight">Suggested NGOs</h2>
                    <Link href="/search?q=ngo" className="text-[10px] text-black font-semibold cursor-pointer hover:underline">
                        See all
                    </Link>
                </div>

                {ngos.length === 0 ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-slate-200 rounded-xl shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="h-3 w-24 bg-slate-200 rounded" />
                                        <div className="h-2.5 w-16 bg-slate-100 rounded" />
                                    </div>
                                </div>
                                <div className="h-7 w-16 bg-slate-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ngos.map((ngo) => (
                            <div key={ngo.id} className="flex items-center justify-between gap-2 group">
                                <Link href={`/profile/${ngo.username}`} className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 bg-indigo-100 flex items-center justify-center">
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
                                        <h3 className="text-[13px] font-bold text-slate-800 leading-tight truncate flex items-center gap-1">
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
                                    initialFollowing={followStates[ngo.auth0Id] ?? false}
                                    onFollowChange={(f) => setFollowStates(prev => ({ ...prev, [ngo.auth0Id]: f }))}
                                    size="sm"
                                    className="shrink-0"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {projects.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-indigo-600" />
                        <h2 className="font-bold text-sm text-slate-900">Trending Projects</h2>
                    </div>

                    <div className="space-y-5">
                        {projects.map((p) => {
                            const pct = p.goalAmount > 0
                                ? Math.round((p.raisedAmount / p.goalAmount) * 100)
                                : 0;
                            return (
                                <Link key={p.id} href="/project" className="block group cursor-pointer">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {p.title}
                                        </h3>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-[#EEF3F8] px-1.5 py-0.5 rounded-md shrink-0">
                                            {pct}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1">
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