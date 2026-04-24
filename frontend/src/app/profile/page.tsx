"use client";
import React, { useState } from 'react';
import { MapPin, Mail, Calendar, Edit3, Briefcase, Check, DollarSign, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const user = {
    name: "John Doe",
    bio: "Passionate about environmental conservation and community development. Love connecting NGOs with resources and volunteers.",
    location: "San Francisco, CA",
    email: "john.doe@email.com",
    joined: "January 2025",
    skills: ["Project Management", "Fundraising", "Community Outreach", "Social Media", "Event Planning"],
    stats: { following: 4, applications: 3, donations: 3 },
};

const following = [
    { id: 1, name: "Green Earth Foundation", verified: true, desc: "Environmental conservation and sustainable development", initials: "G", color: "from-emerald-600 to-emerald-800" },
    { id: 2, name: "Hope for Children", verified: true, desc: "Providing education to underserved communities", initials: "H", color: "from-slate-600 to-slate-800" },
    { id: 3, name: "Water for All", verified: true, desc: "Clean water access for rural communities", initials: "W", color: "from-blue-600 to-blue-800" },
    { id: 4, name: "Food Relief Network", verified: false, desc: "Fighting hunger with community food programs", initials: "F", color: "from-orange-600 to-orange-800" },
];

const applications = [
    { id: 1, project: "Reforestation Drive 2026", ngo: "Green Earth Foundation", status: "Accepted", date: "Mar 15, 2026" },
    { id: 2, project: "School Supplies Drive", ngo: "Education Alliance", status: "Pending", date: "Apr 1, 2026" },
    { id: 3, project: "Mobile Health Clinic", ngo: "Health Access Initiative", status: "Rejected", date: "Feb 20, 2026" },
];

const donations = [
    { id: 1, project: "Clean Water Initiative", ngo: "Water for All", amount: 50, date: "Apr 10, 2026" },
    { id: 2, project: "School Supplies Drive", ngo: "Education Alliance", amount: 25, date: "Mar 5, 2026" },
    { id: 3, project: "Emergency Relief Fund", ngo: "Health Access Initiative", amount: 100, date: "Feb 12, 2026" },
];

const appStatusStyle: Record<string, string> = {
    Accepted: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Rejected: "bg-red-100 text-red-700",
};

const tabs = [
    { key: "following", label: "Following", count: 4 },
    { key: "applications", label: "Applications", count: 3 },
    { key: "donations", label: "Donations", count: 3 },
    { key: "activity", label: "Activity", count: 2 },
];

const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy & Terms', href: '/privacy' },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("following");
    const [followList, setFollowList] = useState(following.map(f => ({ ...f, following: true })));

    const toggleFollow = (id: number) =>
        setFollowList(prev => prev.map(f => f.id === id ? { ...f, following: !f.following } : f));

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start gap-5">
                        <div className="h-20 w-20 bg-linear-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{user.bio}</p>
                                </div>
                                <button className="flex items-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0">
                                    <Edit3 size={13} /> Edit Profile
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                                {[
                                    { Icon: MapPin, text: user.location },
                                    { Icon: Mail, text: user.email },
                                    { Icon: Calendar, text: `Joined ${user.joined}` },
                                ].map(({ Icon, text }) => (
                                    <div key={text} className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Icon size={12} className="shrink-0" /> {text}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Briefcase size={12} className="text-slate-400" />
                                    <span className="font-semibold text-slate-700">Skills:</span>
                                </div>
                                {user.skills.map(skill => (
                                    <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { value: user.stats.following, label: "Following", color: "text-indigo-600" },
                        { value: user.stats.applications, label: "Volunteer Applications", color: "text-emerald-600" },
                        { value: user.stats.donations, label: "Donations Made", color: "text-violet-600" },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100 px-2 pt-2 overflow-x-auto scrollbar-hide">
                        {tabs.map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === key
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                {label}
                                <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-5">
                        {activeTab === "following" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {followList.map(ngo => (
                                    <div key={ngo.id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`h-12 w-12 bg-linear-to-br ${ngo.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                                                {ngo.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
                                                    {ngo.name}
                                                    {ngo.verified && <Check size={12} className="text-[#0A66C2]" />}
                                                </p>
                                                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{ngo.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleFollow(ngo.id)}
                                            className={`w-full text-xs font-bold py-2 rounded-xl transition-all border ${ngo.following
                                                    ? "border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500"
                                                    : "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                                }`}
                                        >
                                            {ngo.following ? "Unfollow" : "+ Follow"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === "applications" && (
                            <div className="space-y-3">
                                {applications.map(app => (
                                    <div key={app.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:shadow-sm transition-all">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{app.project}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{app.ngo} · {app.date}</p>
                                        </div>
                                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${appStatusStyle[app.status]}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === "donations" && (
                            <div className="space-y-3">
                                {donations.map(d => (
                                    <div key={d.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:shadow-sm transition-all">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{d.project}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{d.ngo} · {d.date}</p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                            ${d.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === "activity" && (
                            <div className="text-center py-12 text-slate-400">
                                <Activity size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-semibold">Recent activity will appear here</p>
                                <p className="text-xs mt-1">Posts, comments, and interactions show up here</p>
                            </div>
                        )}
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
            </div>
        </div>
    );
}