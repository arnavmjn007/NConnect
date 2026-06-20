"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search, Building2, Users, FolderOpen,
    Package, BadgeCheck, MapPin, X
} from 'lucide-react';
import FollowButton from '@/components/feed/FollowButton';

interface SearchResults {
    users: Array<{ id: string; username: string; fullName: string | null; occupation: string | null; location: string | null; profileImageUrl: string | null }>;
    ngos: Array<{ id: string; username: string; organizationName: string; location: string | null; ngoCategories: string | null; verified: boolean; verificationStatus: string; auth0Id: string }>;
    projects: Array<{ id: string; title: string; category: string; ngoName: string | null; status: string; location: string | null; goalAmount: number | null; raisedAmount: number | null }>;
    resources: Array<{ id: string; name: string; category: string; status: string; sharingType: string | null; condition: string | null }>;
}

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

type Tab = 'all' | 'ngos' | 'people' | 'projects' | 'resources';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get('q') || '';

    const [query, setQuery] = useState(q);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [allNgos, setAllNgos] = useState<NgoItem[]>([]);
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [ngosLoading, setNgosLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('all');

    useEffect(() => { setQuery(q); }, [q]);

    useEffect(() => {
        if (q.trim()) return;
        let cancelled = false;
        setNgosLoading(true);
        async function load() {
            try {
                const res = await fetch('/api/users?role=NGO&limit=50');
                if (res.ok && !cancelled) {
                    const data: NgoItem[] = await res.json();
                    setAllNgos(data);
                    // Check follow states
                    const states: Record<string, boolean> = {};
                    await Promise.all(data.map(async ngo => {
                        try {
                            const r = await fetch(`/api/follow/${encodeURIComponent(ngo.auth0Id)}/counts`);
                            if (r.ok) {
                                const d = await r.json();
                                states[ngo.auth0Id] = d.isFollowing ?? false;
                            }
                        } catch { /* silent */ }
                    }));
                    if (!cancelled) setFollowStates(states);
                }
            } catch { /* silent */ }
            finally { if (!cancelled) setNgosLoading(false); }
        }
        load();
        return () => { cancelled = true; };
    }, [q]);

    useEffect(() => {
        if (!q.trim()) { setResults(null); setLoading(false); return; }
        let cancelled = false;
        async function doSearch() {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
                if (!cancelled && res.ok) setResults(await res.json());
            } catch { /* silent */ }
            finally { if (!cancelled) setLoading(false); }
        }
        doSearch();
        return () => { cancelled = true; };
    }, [q]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const total = results
        ? results.users.length + results.ngos.length + results.projects.length + results.resources.length
        : 0;

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: total },
        { key: 'ngos', label: 'NGOs', count: results?.ngos.length ?? 0 },
        { key: 'people', label: 'People', count: results?.users.length ?? 0 },
        { key: 'projects', label: 'Projects', count: results?.projects.length ?? 0 },
        { key: 'resources', label: 'Resources', count: results?.resources.length ?? 0 },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="bg-white border-b border-slate-200 px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search NConnect..."
                            className="w-full pl-11 pr-10 py-3 bg-slate-100 border border-transparent rounded-2xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                        {query && (
                            <button type="button" onClick={() => { setQuery(''); router.push('/search'); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={15} />
                            </button>
                        )}
                    </form>
                    {q && !loading && (
                        <p className="text-xs text-slate-500 mt-2 px-1">
                            {total} result{total !== 1 ? 's' : ''} for <span className="font-semibold text-slate-700">&ldquo;{q}&rdquo;</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {!q.trim() && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-indigo-500" />
                            <h2 className="font-bold text-slate-900 text-sm">All NGOs on NConnect</h2>
                        </div>

                        {ngosLoading ? (
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex items-center gap-3">
                                        <div className="h-12 w-12 bg-slate-200 rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                            <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        </div>
                                        <div className="h-8 w-20 bg-slate-100 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : allNgos.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <Building2 size={32} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500 font-semibold">No NGOs yet</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                                {allNgos.map(ngo => (
                                    <div key={ngo.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                        <Link href={`/profile/${ngo.username}`} className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-indigo-100 flex items-center justify-center">
                                                {ngo.profileImageUrl ? (
                                                    <Image src={ngo.profileImageUrl} alt={ngo.organizationName}
                                                        width={48} height={48} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-indigo-700 font-bold text-lg">
                                                        {(ngo.organizationName || ngo.username || '?').charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                                    {ngo.organizationName || ngo.username}
                                                    {ngo.verified && <BadgeCheck size={14} className="text-indigo-500 shrink-0" />}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">@{ngo.username}</p>
                                                {ngo.location && (
                                                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10} />{ngo.location}
                                                    </p>
                                                )}
                                                {ngo.ngoCategories && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {ngo.ngoCategories.split(',').slice(0, 3).map(c => (
                                                            <span key={c} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                                                {c.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
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
                )}

                {q.trim() && (
                    <>
                        {results && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-x-auto scrollbar-hide">
                                {tabs.map(({ key, label, count }) => (
                                    <button key={key} onClick={() => setActiveTab(key)}
                                        className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === key
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                            }`}>
                                        {label}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-center py-16">
                                <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {!loading && results && total === 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                                <Search size={36} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-600 font-semibold">No results found</p>
                                <p className="text-slate-400 text-sm mt-1">Try different keywords or check spelling</p>
                            </div>
                        )}

                        {!loading && results && (activeTab === 'all' || activeTab === 'ngos') && results.ngos.length > 0 && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                                    <Building2 size={14} className="text-indigo-500" />
                                    <h2 className="text-sm font-bold text-slate-900">NGOs</h2>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {results.ngos.map(ngo => (
                                        <div key={ngo.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                            <Link href={`/profile/${ngo.username}`} className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Building2 size={20} className="text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                                        {ngo.organizationName}
                                                        {ngo.verified && <BadgeCheck size={15} className="text-indigo-500" />}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">@{ngo.username}</p>
                                                    {ngo.location && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} />{ngo.location}
                                                        </p>
                                                    )}
                                                    {ngo.ngoCategories && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {ngo.ngoCategories.split(',').slice(0, 3).map(c => (
                                                                <span key={c} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                                                    {c.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
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
                            </section>
                        )}

                        {!loading && results && (activeTab === 'all' || activeTab === 'people') && results.users.length > 0 && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                                    <Users size={14} className="text-emerald-500" />
                                    <h2 className="text-sm font-bold text-slate-900">People</h2>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {results.users.map(u => (
                                        <Link key={u.id} href={`/profile/${u.username}`}
                                            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                            <div className="h-12 w-12 rounded-2xl overflow-hidden shrink-0">
                                                {u.profileImageUrl ? (
                                                    <Image src={u.profileImageUrl} alt={u.username || ''} width={48} height={48} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                                                        {(u.fullName || u.username || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm">{u.fullName || u.username}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">@{u.username}</p>
                                                {u.occupation && <p className="text-xs text-slate-500 mt-0.5">{u.occupation}</p>}
                                                {u.location && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10} />{u.location}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {!loading && results && (activeTab === 'all' || activeTab === 'projects') && results.projects.length > 0 && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                                    <FolderOpen size={14} className="text-violet-500" />
                                    <h2 className="text-sm font-bold text-slate-900">Projects</h2>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {results.projects.map(p => {
                                        const progress = p.goalAmount && p.raisedAmount
                                            ? Math.min((p.raisedAmount / p.goalAmount) * 100, 100)
                                            : 0;
                                        return (
                                            <Link key={p.id} href="/project"
                                                className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                                <div className="h-12 w-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
                                                    <FolderOpen size={20} className="text-violet-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {p.category}{p.ngoName ? ` · ${p.ngoName}` : ''}
                                                    </p>
                                                    {p.location && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} />{p.location}
                                                        </p>
                                                    )}
                                                    {p.goalAmount && (
                                                        <div className="mt-2">
                                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-48">
                                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                NPR {(p.raisedAmount ?? 0).toLocaleString()} of {p.goalAmount.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {p.status}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {!loading && results && (activeTab === 'all' || activeTab === 'resources') && results.resources.length > 0 && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                                    <Package size={14} className="text-orange-500" />
                                    <h2 className="text-sm font-bold text-slate-900">Resources</h2>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {results.resources.map(r => (
                                        <Link key={r.id} href="/resources"
                                            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                            <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                                                <Package size={20} className="text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{r.category}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {r.status}
                                                    </span>
                                                    {r.sharingType && (
                                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                            {r.sharingType}
                                                        </span>
                                                    )}
                                                    {r.condition && (
                                                        <span className="text-[10px] text-slate-400">{r.condition}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}