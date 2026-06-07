"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard, ShieldCheck, Users, FolderOpen,
    Package, Flag, DollarSign, Megaphone,
    BarChart3, ScrollText, Settings, LogOut,
    ChevronLeft, Menu, Zap
} from 'lucide-react';

const NAV = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
    { href: "/admin/ngo-verification", label: "NGO Verification", Icon: ShieldCheck, badge: "pending" },
    { href: "/admin/users", label: "Users", Icon: Users },
    { href: "/admin/projects", label: "Projects", Icon: FolderOpen },
    { href: "/admin/resources", label: "Resources", Icon: Package },
    { href: "/admin/reports", label: "Reports", Icon: Flag, badge: "open" },
    { href: "/admin/donations", label: "Donations", Icon: DollarSign },
    { href: "/admin/announcements", label: "Announcements", Icon: Megaphone },
    { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
    { href: "/admin/audit-logs", label: "Audit Logs", Icon: ScrollText },
    { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { dbUser, isLoading } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!dbUser || dbUser.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                        <ShieldCheck size={32} className="text-red-400" />
                    </div>
                    <p className="text-white font-bold text-lg">Access Denied</p>
                    <p className="text-slate-400 text-sm">Admin privileges required.</p>
                    <button onClick={() => router.push("/")}
                        className="mt-2 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0B0F] flex">
            <aside className={`${collapsed ? "w-16" : "w-56"} shrink-0 bg-[#0D0E14] border-r border-white/5 flex flex-col transition-all duration-200 sticky top-0 h-screen`}>
                <div className="h-14 flex items-center px-4 border-b border-white/5 gap-3">
                    {!collapsed && (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                <Zap size={14} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-xs font-black tracking-wide truncate">NCONNECT</p>
                                <p className="text-indigo-400 text-[9px] font-bold tracking-widest uppercase">Admin Portal</p>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setCollapsed(!collapsed)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0">
                        {collapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {NAV.map(({ href, label, Icon, exact }) => {
                        const isExactActive = pathname === href;
                        const isActive = exact ? isExactActive : (pathname.startsWith(href) && href !== "/admin") || isExactActive;

                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${isActive ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}>
                                <Icon size={15} className={`shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                {!collapsed && <span className="truncate">{label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {!collapsed && (
                    <div className="p-3 border-t border-white/5">
                        <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
                            <div className="h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                {dbUser.fullName?.charAt(0) || "A"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-bold truncate">{dbUser.fullName || "Admin"}</p>
                                <p className="text-slate-500 text-[10px] truncate">{dbUser.email}</p>
                            </div>
                            <Link href="/auth/logout" className="text-slate-500 hover:text-red-400 transition-colors">
                                <LogOut size={13} />
                            </Link>
                        </div>
                    </div>
                )}
            </aside>

            <main className="flex-1 min-w-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}