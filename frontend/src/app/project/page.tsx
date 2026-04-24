"use client";
import React, { useState } from 'react';
import {
    Search, MapPin, Calendar, DollarSign, Users, TrendingUp,
    BookmarkPlus, Filter, Droplets, GraduationCap, Heart,
    Leaf, Utensils, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
    { label: "All Projects", value: "all", Icon: null },
    { label: "Water & Sanitation", value: "water", Icon: Droplets },
    { label: "Education", value: "education", Icon: GraduationCap },
    { label: "Health", value: "health", Icon: Heart },
    { label: "Environment", value: "environment", Icon: Leaf },
    { label: "Food Security", value: "food", Icon: Utensils },
    { label: "Emergency Relief", value: "emergency", Icon: AlertTriangle },
];
const projects = [
    { id: 1, title: "Clean Water Initiative – Build Wells in Rural Kenya", ngo: "Water for All", verified: true, location: "Western Kenya", dateRange: "Jan 15 – Jun 30, 2026", raised: 45000, goal: 50000, donors: 234, volunteers: 4, category: "water", urgent: false, color: "from-blue-900 to-blue-700" },
    { id: 2, title: "School Supplies Drive for Rural Communities", ngo: "Education Alliance", verified: true, location: "Kathmandu, Nepal", dateRange: "Feb 1 – May 31, 2026", raised: 12000, goal: 20000, donors: 89, volunteers: 12, category: "education", urgent: false, color: "from-violet-900 to-violet-700" },
    { id: 3, title: "Emergency Relief Fund – Earthquake Response", ngo: "Health Access Initiative", verified: true, location: "Southern Turkey", dateRange: "Ongoing", raised: 78000, goal: 100000, donors: 412, volunteers: 28, category: "emergency", urgent: true, color: "from-rose-900 to-orange-700" },
    { id: 4, title: "Urban Farming & Food Security Initiative", ngo: "Food Relief Network", verified: false, location: "Nairobi, Kenya", dateRange: "Mar 1 – Dec 31, 2026", raised: 8500, goal: 15000, donors: 63, volunteers: 7, category: "food", urgent: false, color: "from-orange-900 to-orange-700" },
    { id: 5, title: "Reforestation Project – Plant 100K Trees", ngo: "Green Earth Foundation", verified: true, location: "Amazon Basin, Brazil", dateRange: "Apr 1 – Dec 31, 2026", raised: 31000, goal: 40000, donors: 187, volunteers: 35, category: "environment", urgent: false, color: "from-emerald-900 to-emerald-700" },
    { id: 6, title: "Mobile Health Clinic for Remote Villages", ngo: "Health Access Initiative", verified: true, location: "Rural Nepal", dateRange: "May 1 – Oct 31, 2026", raised: 22000, goal: 35000, donors: 145, volunteers: 9, category: "health", urgent: false, color: "from-teal-900 to-teal-700" },
];
function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
    const pct = Math.min((raised / goal) * 100, 100);
    return (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
                className="bg-linear-to-r from-indigo-600 to-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}
function ProjectCard({ project }: { project: typeof projects[0] }) {
    const pct = Math.round((project.raised / project.goal) * 100);
    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer">
            <div className={`h-32 bg-linear-to-br ${project.color} relative flex items-end p-4`}>
                {project.urgent && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={10} /> Urgent
                    </span>
                )}
                <button className="absolute top-3 left-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all">
                    <BookmarkPlus size={14} />
                </button>
                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{project.title}</h3>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {project.ngo.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                        {project.ngo}
                        {project.verified && <span className="text-[#0A66C2] text-xs">✓</span>}
                    </p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><MapPin size={11} />{project.location}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><Calendar size={11} />{project.dateRange}</div>
                </div>
                <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-700">${project.raised.toLocaleString()} raised</span>
                        <span className="text-indigo-600">{pct}%</span>
                    </div>
                    <ProgressBar raised={project.raised} goal={project.goal} />
                    <p className="text-[10px] text-slate-400 mt-1">of ${project.goal.toLocaleString()} goal</p>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <DollarSign size={11} className="text-indigo-500" />
                        <span><strong className="text-slate-700">{project.donors}</strong> donors</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Users size={11} className="text-emerald-500" />
                        <span><strong className="text-slate-700">{project.volunteers}</strong> volunteers</span>
                    </div>
                </div>
                <div className="flex gap-2 pt-1">
                    <button className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                        Donate Now
                    </button>
                    <button className="flex-1 border border-indigo-600 text-indigo-600 text-xs font-bold py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                        Volunteer
                    </button>
                </div>
            </div>
        </article>
    );
}
export default function ProjectsPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const filtered = projects.filter(p => {
        const matchCat = activeCategory === "all" || p.category === activeCategory;
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.ngo.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <aside className="hidden md:flex md:flex-col md:col-span-3 sticky top-20 self-start space-y-4 max-h-[calc(100vh-5rem)]">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 pb-2">Categories</p>
                            {categories.map(({ label, value, Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setActiveCategory(value)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left
                                        ${activeCategory === value ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {Icon
                                        ? <Icon size={15} className={activeCategory === value ? "text-indigo-600" : "text-slate-400"} />
                                        : <div className="w-3.75" />
                                    }
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={14} className="text-indigo-600" />
                                <h3 className="text-sm font-bold text-slate-800">Platform Stats</h3>
                            </div>
                            {[
                                { label: "Active Projects", value: "248" },
                                { label: "Total Raised", value: "$2.4M" },
                                { label: "Volunteers", value: "1,240" },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                                    <span className="text-slate-500">{s.label}</span>
                                    <span className="font-bold text-slate-800">{s.value}</span>
                                </div>
                            ))}
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
                    <main className="col-span-1 md:col-span-9 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Projects</h1>
                                <p className="text-sm text-slate-500">{filtered.length} project{filtered.length !== 1 ? "s" : ""} found</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 transition-all">
                                    <Filter size={14} /> Filter
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(project => <ProjectCard key={project.id} project={project} />)}
                        </div>
                        {filtered.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <p className="text-lg font-semibold">No projects found</p>
                                <p className="text-sm mt-1">Try a different category or search term</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}


