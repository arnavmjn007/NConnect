"use client";
import React, { useState } from 'react';
import { Search, Plus, Package, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Status = "Available" | "Requested" | "Shared";

const statusStyle: Record<Status, string> = {
    Available: "bg-green-100  text-green-700",
    Requested: "bg-orange-100 text-orange-700",
    Shared: "bg-violet-100 text-violet-700",
};

const resources = [
    { id: 1, name: "Cargo Van (2020 Ford Transit)", type: "Vehicle", desc: "15-passenger cargo van, great for transporting supplies and volunteers", ngo: "Green Earth Foundation", location: "San Francisco, CA", status: "Available" as Status },
    { id: 2, name: "Industrial Projector & Screen", type: "Equipment", desc: "Professional projector and 10ft screen for presentations and events", ngo: "Hope for Children", location: "Los Angeles, CA", status: "Requested" as Status },
    { id: 3, name: "Conference Room (50 seats)", type: "Space", desc: "Large conference room available weekends for community events", ngo: "Food Relief Network", location: "Seattle, WA", status: "Available" as Status },
    { id: 4, name: "Medical Equipment Set", type: "Equipment", desc: "Basic medical check-up equipment including BP monitors and stethoscopes", ngo: "Health Access Initiative", location: "Chicago, IL", status: "Shared" as Status },
    { id: 5, name: "Folding Tables & Chairs (40 sets)", type: "Furniture", desc: "Event furniture for outdoor and indoor community gatherings", ngo: "Water for All", location: "New York, NY", status: "Available" as Status },
    { id: 6, name: "Refrigerated Transport Van", type: "Vehicle", desc: "Temperature-controlled van ideal for food donation drives", ngo: "Food Relief Network", location: "Houston, TX", status: "Requested" as Status },
];

const myResources = [
    { name: "Office Supplies", status: "Available" as Status, requests: 3 },
    { name: "Volunteer T-Shirts (500)", status: "Shared" as Status, requests: 0 },
];

const myRequests = [
    { name: "Cargo Van", from: "Green Earth Foundation", reqStatus: "Pending" },
    { name: "Industrial Projector", from: "Hope for Children", reqStatus: "Approved" },
];



export default function ResourcesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const filtered = resources.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.ngo.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "All Types" || r.type === typeFilter;
        const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    const footerLinks = [
        { name: 'About', href: '/about' },
        { name: 'Accessibility', href: '/accessibility' },
        { name: 'Help Center', href: '/help' },
        { name: 'Privacy & Terms', href: '/privacy' },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Shared Resources</h1>
                        <p className="text-sm text-slate-500 mt-1">Discover and share resources with other NGOs in the community</p>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0">
                        <Plus size={16} /> Add Resource
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    <main className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search resources..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { val: typeFilter, set: setTypeFilter, opts: ["All Types", "Vehicle", "Equipment", "Space", "Furniture"] },
                                        { val: statusFilter, set: setStatusFilter, opts: ["All Status", "Available", "Requested", "Shared"] },
                                    ].map(({ val, set, opts }) => (
                                        <select
                                            key={opts[0]}
                                            value={val}
                                            onChange={e => set(e.target.value)}
                                            className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-600 cursor-pointer"
                                        >
                                            {opts.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filtered.map(resource => (
                                <article key={resource.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Package size={20} className="text-blue-500" />
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyle[resource.status]}`}>
                                            {resource.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{resource.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium mb-2">{resource.type}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{resource.desc}</p>
                                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{resource.ngo}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                                <MapPin size={10} /> {resource.location}
                                            </div>
                                        </div>
                                        {resource.status === "Available" && (
                                            <button className="border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full transition-all">
                                                Request
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </main>

                    <aside className="lg:col-span-4 space-y-4 sticky top-20 self-start">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h2 className="font-bold text-sm text-slate-900 mb-4">My Resources</h2>
                            <div className="space-y-3">
                                {myResources.map(r => (
                                    <div key={r.name} className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                            <p className="text-[11px] text-slate-400">{r.requests} active requests</p>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusStyle[r.status]}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-xl hover:bg-slate-50 transition-all">
                                Manage All
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h2 className="font-bold text-sm text-slate-900 mb-4">My Requests</h2>
                            <div className="space-y-4">
                                {myRequests.map(r => (
                                    <div key={r.name} className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                        <p className="text-[11px] text-slate-400">from {r.from}</p>
                                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${r.reqStatus === "Pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                                            }`}>
                                            {r.reqStatus}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                            {footerLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                            <Image src="/logo.png" alt="NConnect" width={60} height={60} />
                            <p className="text-[11px] text-slate-400 font-medium">NConnect Corp © 2026</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}