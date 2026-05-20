import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FOOTER_LINKS = [
    { name: 'About', href: '/about' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy & Terms', href: '/privacy' },
];

export default function SiteFooter() {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {FOOTER_LINKS.map(link => (
                    <Link
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
            <div className="flex items-center justify-center gap-1.5">
                <Image src="/logo.png" alt="NConnect" width={60} height={60} />
                <p className="text-[11px] text-slate-400 font-medium">NConnect Corp © 2026</p>
            </div>
        </div>
    );
}