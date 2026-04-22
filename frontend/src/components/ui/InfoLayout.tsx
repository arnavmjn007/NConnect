import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search } from 'lucide-react';

interface InfoLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    showSearch?: boolean;
}

export default function InfoLayout({ title, subtitle, children, showSearch = false }: InfoLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F3F2EF] font-sans text-slate-900">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                        <div className="h-6 w-px bg-slate-200 hidden md:block" />
                        <span className="text-slate-500 text-sm font-medium hidden md:block">{title}</span>
                    </div>

                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">
                        <ArrowLeft size={16} /> Back to Feed
                    </Link>
                </div>
            </nav>

            <div className="bg-white border-b border-slate-200 py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl font-light text-slate-800">{title}</h1>
                    {subtitle && <p className="text-lg text-slate-500 mt-2 font-light">{subtitle}</p>}

                    {showSearch && (
                        <div className="mt-6 relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="How can we help?"
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-600 rounded-md outline-none transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-white rounded-lg border border-slate-200 p-8 md:p-12 shadow-sm">
                    {children}
                </div>

                <footer className="mt-12 text-center text-slate-400 text-xs pb-12">
                    © 2026 NConnect Corporation • User Agreement • Privacy Policy • Cookie Policy
                </footer>
            </main>
        </div>
    );
}