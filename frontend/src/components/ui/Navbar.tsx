"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Home,
    MessageSquare,
    UserCircle,
    Search,
    Bell,
    Package,
    FolderOpen,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    badge?: number;
}

const NavItem = ({ href, icon: Icon, label, badge }: NavItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={cn(
                "relative flex flex-col items-center justify-center min-w-16 md:min-w-20 py-1 transition-all group",
                isActive ? "text-indigo-600 bg-indigo-50/50 rounded-xl" : "text-slate-500"
            )}
        >
            <div className="relative">
                <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-transform duration-150 group-hover:scale-110"
                />
                {badge && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {badge}
                    </span>
                )}
            </div>
            <span className="hidden md:block text-[11px] mt-1 font-semibold tracking-tight">
                {label}
            </span>
            {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0A66C2] rounded-full" />
            )}
        </Link>
    );
};

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">

                <div className="flex items-center gap-3 flex-1">
                    <Link href="/" className="shrink-0">
                        <Image
                            src="/logo.png"
                            alt="NConnect"
                            width={80}
                            height={80}
                            className="rounded-sm object-contain"
                            priority
                        />
                    </Link>

                    <div className="relative max-w-xs w-full hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search NConnect..."
                            className="w-full bg-slate-100 border border-transparent rounded-xl py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0A66C2] focus:ring-[#0A66C2]/10 focus:ring-2 transition-all"
                        />
                    </div>

                    <button className="sm:hidden p-2 text-slate-500 hover:text-[#0A66C2] transition-colors">
                        <Search size={20} />
                    </button>
                </div>

                <div className="flex items-center h-full gap-0.5">
                    <NavItem href="/" icon={Home} label="Home" />
                    <NavItem href="/project" icon={FolderOpen} label="Projects" />
                    <NavItem href="/resources" icon={Package} label="Resources" />
                    <NavItem href="/messages" icon={MessageSquare} label="Messaging" />
                    <NavItem href="/notifications" icon={Bell} label="Alerts" badge={1} />

                    <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />

                    <NavItem href="/profile" icon={UserCircle} label="Me" />
                </div>
            </div>
        </nav>
    );
}