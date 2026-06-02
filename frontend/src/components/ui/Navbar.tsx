"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    Home, MessageSquare, Search, Bell, Package,
    FolderOpen, LucideIcon, ChevronDown, User,
    Settings, LogOut, 
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps { href: string; icon: LucideIcon; label: string; badge?: number; }

const NavItem = ({ href, icon: Icon, label, badge }: NavItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
        <Link href={href} className={cn("relative flex flex-col items-center justify-center min-w-16 md:min-w-20 py-1 transition-all group", isActive ? "text-indigo-600 bg-indigo-50/50 rounded-xl" : "text-slate-500")}>
            <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className="transition-transform duration-150 group-hover:scale-110" />
                {badge && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {badge > 9 ? "9+" : badge}
                    </span>
                )}
            </div>
            <span className="hidden md:block text-[11px] mt-1 font-semibold tracking-tight">{label}</span>
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0A66C2] rounded-full" />}
        </Link>
    );
};

export default function Navbar() {
    const { user, dbUser, isLoading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayName = dbUser?.fullName || user?.name || "User";
    // const displayEmail = dbUser?.email || user?.email || "";
    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const occupation = dbUser?.occupation || (dbUser?.role === "NGO" ? "NGO Organization" : null);
    const initial = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
                <div className="flex items-center gap-3 flex-1">
                    <Link href="/" className="shrink-0">
                        <Image src="/Logo.png" alt="NConnect" width={90} height={90} className="rounded-sm object-contain" priority />
                    </Link>
                    <div className="relative max-w-xs w-full hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search NConnect..."
                            className="w-full bg-slate-100 border border-transparent rounded-xl py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0A66C2] focus:ring-[#0A66C2]/10 focus:ring-2 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center h-full gap-0.5">
                    <NavItem href="/" icon={Home} label="Home" />
                    <NavItem href="/project" icon={FolderOpen} label="Projects" />
                    <NavItem href="/resources" icon={Package} label="Resources" />
                    <NavItem href="/messages" icon={MessageSquare} label="Messaging" />
                    <NavItem href="/notifications" icon={Bell} label="Alerts" badge={1} />

                    <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />

                    {isLoading ? (
                        <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse mx-2" />
                    ) : user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(p => !p)}
                                className="flex flex-col items-center gap-0.5 pl-2 group"
                            >
                                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-indigo-300 transition-all">
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
                                                {/* <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p> */}
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
                                        {/* <Link
                                            href="/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <Settings size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                            <span className="text-sm font-medium text-slate-700">Settings & Privacy</span>
                                        </Link> */}
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
                        <Link href="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all whitespace-nowrap ml-2">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}