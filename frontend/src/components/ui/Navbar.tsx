"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Briefcase,
    LayoutGrid,
    MessageSquare,
    UserCircle,
    Search,
    Bell,
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
                "flex flex-col items-center justify-center min-w-16 md:min-w-20 transition-all relative group py-1",
                isActive ? "text-black" : "text-gray-500 hover:text-black"
            )}
        >
            <div className="relative">
                <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-transform group-hover:scale-105"
                />
                {badge && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                        {badge}
                    </span>
                )}
            </div>
            <span className="hidden md:block text-[12px] mt-1 font-normal">
                {label}
            </span>

            {isActive && (
                <div className="absolute bottom-0 w-full h-0.5 bg-white" />
            )}
        </Link>
    );
};

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between h-13 px-4">

                <div className="flex items-center flex-1 gap-2">
                    <Link href="/" className="shrink-0">
                        <div className="bg-[#0A66C2] text-white rounded-sm font-bold text-xl w-8 h-8 flex items-center justify-center">
                            N
                        </div>
                    </Link>

                    <div className="relative max-w-70 w-full hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-[#edf3f8] border-none rounded-sm py-1.5 pl-10 pr-4 w-full text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <button className="sm:hidden p-2 text-gray-500">
                        <Search size={20} />
                    </button>
                </div>

                <div className="flex items-center h-full">
                    <NavItem href="/" icon={Home} label="Home" />
                    <NavItem href="/project" icon={Briefcase} label="Projects" />
                    <NavItem href="/resources" icon={LayoutGrid} label="Resources" />
                    <NavItem href="/messages" icon={MessageSquare} label="Messaging" badge={3} />
                    <NavItem href="/notifications" icon={Bell} label="Notifications" badge={1} />

                    <div className="hidden md:block h-full w-px bg-gray-200 mx-2" />
                    <NavItem href="/profile" icon={UserCircle} label="Me" />
                </div>
            </div>
        </nav>
    );
}