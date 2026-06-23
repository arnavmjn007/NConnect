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

const FOOTER_TEXT = "© 2026 NConnect Corporation • User Agreement • Privacy Policy • Cookie Policy";

export default function InfoLayout({ title, subtitle, children, showSearch = false }: InfoLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F3F2EF] text-slate-900 font-sans">
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="shrink-0">
                            <Image
                                src="/logo.png"
                                alt="NConnect"
                                width={80}
                                height={80}
                                className="rounded-xs object-contain"
                                priority
                            />
                        </Link>
                        <div className="hidden h-6 w-px bg-slate-200 md:block" />
                        <span className="hidden text-sm font-medium text-slate-500 md:block">{title}</span>
                    </div>

                    <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                        <ArrowLeft size={16} /> Back to Feed
                    </Link>
                </div>
            </nav>

            <div className="bg-white border-b border-slate-200 py-12">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-4xl font-light text-slate-800">{title}</h1>
                    {subtitle && <p className="mt-2 text-lg font-light text-slate-500">{subtitle}</p>}

                    {showSearch && (
                        <div className="relative mt-6 max-w-xl">
                            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="How can we help?"
                                className="w-full rounded-md border border-transparent bg-slate-100 py-3 pr-4 pl-12 outline-hidden transition-all focus:border-indigo-600 focus:bg-white"
                            />
                        </div>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-4xl py-12 px-6">
                <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-xs md:p-12">
                    {children}
                </div>

                <footer className="mt-12 pb-12 text-center text-xs text-slate-400">
                    {FOOTER_TEXT}
                </footer>
            </main>
        </div>
    );
}