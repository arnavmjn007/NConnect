"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, MapPin, Search, Building2, Sparkles } from 'lucide-react';
import FollowButton from '@/components/feed/FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { getNgoRecommendations } from '@/lib/api';
import SiteFooter from '@/components/ui/SiteFooter';

interface NgoItem {
    id: string;
    auth0Id: string;
    username: string;
    fullName: string;
    organizationName: string;
    profileImageUrl: string;
    location: string;
    verified: boolean;
    verificationStatus: string;
    ngoCategories: string;
}

const CATEGORIES = [
    'All', 'Education', 'Health', 'Environment',
    'Children & Youth', 'Women Empowerment', 'Disaster Relief',
    'Animal Welfare', 'Community Development',
];

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

export default function DiscoverNgosPage() {
    const { user, dbUser } = useAuth();
    const [ngos, setNgos] = useState<NgoItem[]>([]);
    const [filtered, setFiltered] = useState<NgoItem[]>([]);
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [matchScores, setMatchScores] = useState<Record<string, number>>({});
    const [showRecommended, setShowRecommended] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await fetch('/api/users?role=NGO&limit=100');
                if (!res.ok) return;
                const data: NgoItem[] = await res.json();
                const withoutSelf = data.filter(n => n.auth0Id !== user?.sub);
                if (!cancelled) setNgos(withoutSelf);

                const states = await getFollowStates(withoutSelf);
                if (!cancelled) setFollowStates(states);
            } catch { /* silent */ }
            finally { if (!cancelled) setLoading(false); }
        }
        load();
        return () => { cancelled = true; };
    }, [user?.sub]);

    useEffect(() => {
        if (!dbUser || dbUser.role !== "USER") return;
        let cancelled = false;
        getNgoRecommendations()
            .then(data => {
                if (cancelled) return;
                const map: Record<string, number> = {};
                data.forEach(d => { map[d.ngoId] = d.score; });
                setMatchScores(map);
            })
            .catch(() => { /* AI service may be offline — fail silently */ });
        return () => { cancelled = true; };
    }, [dbUser]);

    useEffect(() => {
        let result = ngos;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(n =>
                n.organizationName?.toLowerCase().includes(q) ||
                n.username?.toLowerCase().includes(q) ||
                n.location?.toLowerCase().includes(q) ||
                n.ngoCategories?.toLowerCase().includes(q)
            );
        }
        if (category !== 'All') {
            result = result.filter(n =>
                n.ngoCategories?.toLowerCase().includes(category.toLowerCase())
            );
        }
        if (showRecommended) {
            result = [...result]
                .filter(n => (matchScores[n.id] ?? 0) > 0)
                .sort((a, b) => (matchScores[b.id] ?? 0) - (matchScores[a.id] ?? 0));
        }
        setFiltered(result);
    }, [ngos, search, category, showRecommended, matchScores]);

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Discover NGOs</h1>
                        <p className="text-sm text-slate-500 mt-1">Find and follow NGOs making a difference in Nepal</p>
                    </div>
                    {dbUser?.role === "USER" && Object.keys(matchScores).length > 0 && (
                        <button
                            onClick={() => setShowRecommended(p => !p)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showRecommended
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                }`}
                        >
                            <Sparkles size={13} /> Recommended for You
                        </button>
                    )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search NGOs by name, location, or category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === cat
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {!loading && (
                    <p className="text-xs text-slate-500 px-1">
                        Showing <span className="font-bold text-slate-700">{filtered.length}</span> NGO{filtered.length !== 1 ? 's' : ''}
                        {category !== 'All' && ` in ${category}`}
                        {search && ` matching "${search}"`}
                    </p>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-12 w-12 bg-slate-200 rounded-xl shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                                <div className="h-7 bg-slate-100 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                        <Building2 size={36} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500 font-semibold">No NGOs found</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {showRecommended ? "Add more interests to your profile for better matches" : "Try adjusting your search or category filter"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map(ngo => (
                            <div key={ngo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow relative">
                                {showRecommended && matchScores[ngo.id] !== undefined && (
                                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                                        <Sparkles size={10} /> {matchScores[ngo.id]}% match
                                    </span>
                                )}
                                <div className="flex items-start gap-3">
                                    <Link href={`/profile/${ngo.username}`} className="shrink-0">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center">
                                            {ngo.profileImageUrl ? (
                                                <Image
                                                    src={ngo.profileImageUrl}
                                                    alt={ngo.organizationName}
                                                    width={48}
                                                    height={48}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-indigo-700 font-bold text-lg">
                                                    {(ngo.organizationName || ngo.username || '?').charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/profile/${ngo.username}`}>
                                            <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1 leading-tight">
                                                {ngo.organizationName || ngo.username}
                                                {ngo.verified && <BadgeCheck size={14} className="text-indigo-500 shrink-0" />}
                                            </h3>
                                        </Link>
                                        <p className="text-[11px] text-slate-400 mt-0.5">@{ngo.username}</p>
                                        {ngo.location && (
                                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} />{ngo.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {ngo.ngoCategories && (
                                    <div className="flex flex-wrap gap-1">
                                        {ngo.ngoCategories.split(',').slice(0, 3).map(c => (
                                            <span key={c} className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                                                {c.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <FollowButton
                                    targetAuth0Id={ngo.auth0Id}
                                    initialFollowing={followStates[ngo.auth0Id] ?? false}
                                    onFollowChange={(f) => setFollowStates(prev => ({ ...prev, [ngo.auth0Id]: f }))}
                                    size="sm"
                                    className="w-full justify-center"
                                />
                            </div>
                        ))}
                    </div>
                )}
                <SiteFooter />
            </div>
        </div>
    );
}