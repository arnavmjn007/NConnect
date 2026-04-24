"use client";
import React, { useState } from 'react';
import {
    ThumbsUp, MessageSquare, UserPlus,
    DollarSign, Bell, Settings, Check,
    Filter, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type NType = "like" | "comment" | "follow" | "donation" | "project";
type Tab = "All" | "Mentions" | "Donations" | "Follows";

const notifConfig: Record<NType, { Icon: React.ElementType; color: string; bg: string }> = {
    like: { Icon: ThumbsUp, color: "text-blue-600", bg: "bg-blue-50" },
    comment: { Icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
    follow: { Icon: UserPlus, color: "text-violet-600", bg: "bg-violet-50" },
    donation: { Icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
    project: { Icon: Bell, color: "text-indigo-600", bg: "bg-indigo-50" },
};

const seed = [
    { id: 1, type: "donation" as NType, actor: "Water for All", action: "thanked you for your $50 donation to", subject: "Clean Water Initiative", time: "2 minutes ago", unread: true, tab: "Donations" as Tab },
    { id: 2, type: "follow" as NType, actor: "Education Alliance", action: "started following you", subject: "", time: "1 hour ago", unread: true, tab: "Follows" as Tab },
    { id: 3, type: "like" as NType, actor: "Suraj Maharjan", action: "liked your post about", subject: "Nepal's digital trust initiative", time: "3 hours ago", unread: false, tab: "Mentions" as Tab },
    { id: 4, type: "comment" as NType, actor: "Food Relief Network", action: "commented: ", subject: '"Great initiative!"', time: "5 hours ago", unread: false, tab: "Mentions" as Tab },
    { id: 5, type: "project" as NType, actor: "School Supplies Drive", action: "is 60% funded — your support matters!", subject: "", time: "1 day ago", unread: false, tab: "All" as Tab },
    { id: 6, type: "follow" as NType, actor: "Green Earth Foundation", action: "started following you", subject: "", time: "2 days ago", unread: false, tab: "Follows" as Tab },
    { id: 7, type: "project" as NType, actor: "Emergency Relief Fund", action: "reached 78% of its goal.", subject: "Help push it to 100%!", time: "2 days ago", unread: false, tab: "All" as Tab },
    { id: 8, type: "donation" as NType, actor: "Health Access Initiative", action: "received your donation for", subject: "Mobile Health Clinic", time: "3 days ago", unread: false, tab: "Donations" as Tab },
    { id: 9, type: "like" as NType, actor: "Arnav Maharjan", action: "liked your comment on", subject: "Clean Water Initiative", time: "4 days ago", unread: false, tab: "Mentions" as Tab },
];

const tabs: Tab[] = ["All", "Mentions", "Donations", "Follows"];


const suggested = [
    { name: "Hope for Children", followers: "6.1K", color: "from-rose-600 to-rose-800", initials: "H" },
    { name: "Climate Action Nepal", followers: "3.4K", color: "from-emerald-600 to-emerald-800", initials: "C" },
    { name: "Rural Tech Initiative", followers: "2.8K", color: "from-indigo-600 to-indigo-800", initials: "R" },
];

const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy & Terms', href: '/privacy' },
];

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("All");
    const [notifs, setNotifs] = useState(seed);
    const [followed, setFollowed] = useState<Record<string, boolean>>({});

    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
    const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

    const displayed = activeTab === "All" ? notifs : notifs.filter(n => n.tab === activeTab || n.type === activeTab.toLowerCase().slice(0, -1));
    const unreadCount = notifs.filter(n => n.unread).length;

    const toggleFollow = (name: string) =>
        setFollowed(prev => ({ ...prev, [name]: !prev[name] }));

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <main className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                                    >
                                        <Check size={13} /> Mark all read
                                    </button>
                                )}
                                <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition-all">
                                    <Filter size={15} />
                                </button>
                                <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition-all">
                                    <Settings size={15} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex border-b border-slate-100 px-2 pt-2">
                                {tabs.map(tab => {
                                    const count = tab === "All"
                                        ? notifs.length
                                        : notifs.filter(n => n.tab === tab).length;
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === tab
                                                    ? "border-indigo-600 text-indigo-600"
                                                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl"
                                                }`}
                                        >
                                            {tab}
                                            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${activeTab === tab ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                                                }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="divide-y divide-slate-50">
                                {displayed.length === 0 && (
                                    <div className="text-center py-14">
                                        <Bell size={32} className="mx-auto mb-3 text-slate-200" />
                                        <p className="text-sm font-semibold text-slate-400">No notifications here</p>
                                    </div>
                                )}
                                {displayed.map(notif => {
                                    const { Icon, color, bg } = notifConfig[notif.type];
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => markRead(notif.id)}
                                            className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-slate-50 ${notif.unread ? "bg-indigo-50/40" : "bg-white"
                                                }`}
                                        >
                                            <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                                                <Icon size={18} className={color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                    <span className="font-bold text-slate-900">{notif.actor}</span>
                                                    {" "}{notif.action}{" "}
                                                    {notif.subject && (
                                                        <span className="font-semibold text-indigo-600">{notif.subject}</span>
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-1 font-medium">{notif.time}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {notif.unread && (
                                                    <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />
                                                )}
                                                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                                    <ImageIcon size={14} className="text-slate-300" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                    <aside className="lg:col-span-4 space-y-4 sticky top-20 self-start">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-sm text-slate-900">Suggested NGOs</h2>
                                <span className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer">See all</span>
                            </div>
                            <div className="space-y-3">
                                {suggested.map(ngo => (
                                    <div key={ngo.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 bg-gradient-to-br ${ngo.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                                {ngo.initials}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800 leading-tight">{ngo.name}</p>
                                                <p className="text-[11px] text-slate-400">{ngo.followers} followers</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleFollow(ngo.name)}
                                            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${followed[ngo.name]
                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                    : "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                                }`}
                                        >
                                            {followed[ngo.name] ? "Following" : "+ Follow"}
                                        </button>
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