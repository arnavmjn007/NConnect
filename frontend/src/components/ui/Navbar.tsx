"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import {
    Home, MessageSquare, Search, Bell, Package,
    FolderOpen, LucideIcon, ChevronDown, User,
    Settings, LogOut, Shield, X, Users, Building2,
    Briefcase, Box
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps { href: string; icon: LucideIcon; label: string; badge?: number; }

const NavItem = ({ href, icon: Icon, label, badge }: NavItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
        <Link href={href} className={cn(
            "relative flex flex-col items-center justify-center min-w-13 md:min-w-18 py-1 transition-all group",
            isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
        )}>
            <div className="relative">
                <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-transform duration-150 group-hover:scale-110"
                />
                {typeof badge === 'number' && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {badge > 9 ? "9+" : badge}
                    </span>
                )}
            </div>
            <span className="hidden md:block text-[11px] mt-0.5 font-semibold tracking-tight">{label}</span>
            {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
            )}
        </Link>
    );
};

interface SearchResults {
    users: Array<{ id: string; username: string; fullName: string | null; occupation: string | null; profileImageUrl: string | null; role: string }>;
    ngos: Array<{ id: string; username: string; organizationName: string; location: string | null; verificationStatus: string; verified: boolean }>;
    projects: Array<{ id: string; title: string; category: string; ngoName: string | null; status: string }>;
    resources: Array<{ id: string; name: string; category: string; status: string }>;
}

function SearchDropdown({
    query,
    results,
    suggestions,
    loading,
    onClose,
}: {
    query: string;
    results: SearchResults | null;
    suggestions: string[];
    loading: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const hasResults = results && (
        results.users.length + results.ngos.length +
        results.projects.length + results.resources.length > 0
    );

    const goSearch = () => {
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-120 overflow-y-auto">
            {loading && (
                <div className="flex items-center justify-center py-6">
                    <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!loading && !hasResults && query.trim() && (
                <div className="py-4 px-4 text-center text-slate-400 text-sm">
                    No results for &ldquo;{query}&rdquo;
                </div>
            )}

            {!loading && !query.trim() && suggestions.length === 0 && (
                <div className="py-4 px-4 text-center text-slate-400 text-sm">
                    Start typing to search NGOs, users, projects...
                </div>
            )}

            {!loading && suggestions.length > 0 && !hasResults && (
                <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">Suggestions</p>
                    {suggestions.map((s) => (
                        <button key={s} onClick={() => { router.push(`/search?q=${encodeURIComponent(s)}`); onClose(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left">
                            <Search size={13} className="text-slate-400 shrink-0" />
                            <span className="text-sm text-slate-700">{s}</span>
                        </button>
                    ))}
                </div>
            )}

            {!loading && hasResults && results && (
                <div className="divide-y divide-slate-50">
                    {results.ngos.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
                                <Building2 size={10} /> NGOs
                            </p>
                            {results.ngos.map((ngo) => (
                                <Link key={ngo.id} href={`/profile/${ngo.username}`} onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 size={14} className="text-indigo-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                                            {ngo.organizationName}
                                            {ngo.verified && (
                                                <span className="text-[#0A66C2] text-xs">✓</span>
                                            )}
                                        </p>
                                        <p className="text-[11px] text-slate-400 truncate">@{ngo.username}{ngo.location ? ` · ${ngo.location}` : ''}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.users.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
                                <Users size={10} /> People
                            </p>
                            {results.users.map((u) => (
                                <Link key={u.id} href={`/profile/${u.username}`} onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 rounded-xl overflow-hidden shrink-0">
                                        {u.profileImageUrl ? (
                                            <Image src={u.profileImageUrl} alt={u.username || ''} width={32} height={32} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {(u.fullName || u.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{u.fullName || u.username}</p>
                                        <p className="text-[11px] text-slate-400 truncate">
                                            {u.occupation || `@${u.username}`}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.projects.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
                                <Briefcase size={10} /> Projects
                            </p>
                            {results.projects.map((p) => (
                                <Link key={p.id} href={`/project?search=${encodeURIComponent(p.title)}`} onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                        <FolderOpen size={14} className="text-emerald-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{p.title}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{p.category}{p.ngoName ? ` · ${p.ngoName}` : ''}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.resources.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
                                <Box size={10} /> Resources
                            </p>
                            {results.resources.map((r) => (
                                <Link key={r.id} href="/resources" onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Package size={14} className="text-orange-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{r.name}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{r.category} · {r.status}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="p-2">
                        <button onClick={goSearch}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                            <Search size={13} />
                            See all results for &ldquo;{query}&rdquo;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const router = useRouter();
    const { user, dbUser, isLoading } = useAuth();
    const { unreadCount } = useNotifications();

    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayName = dbUser?.fullName || user?.name || "User";
    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const occupation = dbUser?.occupation || (dbUser?.role === "NGO" ? "NGO Organization" : null);
    const initial = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setSearchResults(null);
            setSuggestions([]);
            setSearchLoading(false);
            return;
        }
        setSearchLoading(true);
        try {
            const sugRes = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
            if (sugRes.ok) setSuggestions(await sugRes.json());
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            if (res.ok) setSearchResults(await res.json());
        } catch {
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleQueryChange = (val: string) => {
        setQuery(val);
        setSearchOpen(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false);
        }
        if (e.key === 'Escape') {
            setSearchOpen(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSearchResults(null);
        setSuggestions([]);
        setSearchOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-3 md:px-6 gap-2">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <Link href="/" className="shrink-0">
                        <Image src="/Logo.png" alt="NConnect" width={90} height={90} className="rounded-sm object-contain" priority />
                    </Link>
                    <div ref={searchRef} className="relative w-full max-w-xs hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        <input
                            type="text"
                            value={query}
                            placeholder="Search NConnect..."
                            onChange={e => handleQueryChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setSearchOpen(true)}
                            className="w-full bg-slate-100 border border-transparent rounded-xl py-2 pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                        {query && (
                            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={13} />
                            </button>
                        )}
                        {searchOpen && (
                            <SearchDropdown
                                query={query}
                                results={searchResults}
                                suggestions={suggestions}
                                loading={searchLoading}
                                onClose={() => setSearchOpen(false)}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center h-full gap-0 shrink-0">
                    <NavItem href="/" icon={Home} label="Home" />
                    <NavItem href="/project" icon={FolderOpen} label="Projects" />
                    <NavItem href="/resources" icon={Package} label="Resources" />
                    <NavItem href="/messages" icon={MessageSquare} label="Messaging" />
                    <NavItem href="/notifications" icon={Bell} label="Alerts" badge={unreadCount} />

                    <div className="hidden md:block h-8 w-px bg-slate-200 mx-1.5" />
                    {isLoading ? (
                        <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse mx-2" />
                    ) : user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(p => !p)}
                                className="flex flex-col items-center gap-0.5 pl-1.5 group"
                            >
                                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-indigo-300 transition-all shrink-0">
                                    {displayImage ? (
                                        <Image src={displayImage} alt={displayName} width={32} height={32} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-linear-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-xs">
                                            {initial}
                                        </div>
                                    )}
                                </div>
                                <span className="hidden md:flex items-center gap-0.5 text-[11px] font-semibold text-slate-500">
                                    Me <ChevronDown size={10} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                                    <div className="p-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                                {displayImage ? (
                                                    <Image src={displayImage} alt={displayName} width={48} height={48} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-linear-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-lg">
                                                        {initial}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
                                                {occupation && <p className="text-xs text-slate-500 truncate">{occupation}</p>}
                                            </div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="mt-3 w-full block text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-bold py-2 rounded-xl transition-all"
                                        >
                                            View Profile
                                        </Link>
                                    </div>

                                    <div className="p-2">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 py-1.5">Account</p>
                                        {[
                                            { Icon: User, label: "My Profile", href: "/profile" },
                                            { Icon: Settings, label: "Settings & Privacy", href: "/settings" },
                                            ...(dbUser?.role === "NGO" ? [{
                                                Icon: Shield,
                                                label: dbUser.verificationStatus === "VERIFIED"
                                                    ? "✓ Verified NGO"
                                                    : dbUser.verificationStatus === "UNDER_REVIEW"
                                                        ? "Verification Pending"
                                                        : "Get Verified",
                                                href: "/verification"
                                            }] : []),
                                        ].map(({ Icon, label, href }) => (
                                            <Link key={label} href={href} onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                                                <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                <span className="text-sm font-medium text-slate-700">{label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="p-2 border-t border-slate-100">
                                        <Link
                                            href="/auth/logout"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group w-full"
                                        >
                                            <LogOut size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-red-500 transition-colors">Sign Out</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all whitespace-nowrap ml-1">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}