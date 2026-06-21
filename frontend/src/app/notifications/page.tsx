"use client";
import React, { useState } from 'react';
import {
    ThumbsUp, MessageSquare, UserPlus, DollarSign,
    Bell, Check, Repeat2,
    ShieldCheck, Package, FolderOpen, Megaphone,
} from 'lucide-react';
import SiteFooter from '@/components/ui/SiteFooter';
import { useNotifications, Notification } from '@/hooks/useNotifications';

type Tab = 'All' | 'Social' | 'Donations' | 'Projects' | 'System';

const TYPE_CONFIG: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
    LIKE: { Icon: ThumbsUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    COMMENT: { Icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    REPOST: { Icon: Repeat2, color: 'text-orange-500', bg: 'bg-orange-50' },
    FOLLOW: { Icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50' },
    MENTION: { Icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    DONATION_RECEIVED: { Icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    DONATION_CONFIRMED: { Icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    DONATION_GOAL_REACHED: { Icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    PROJECT_APPLICATION: { Icon: FolderOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    PROJECT_ACCEPTED: { Icon: FolderOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    PROJECT_REJECTED: { Icon: FolderOpen, color: 'text-red-500', bg: 'bg-red-50' },
    PROJECT_CLOSED: { Icon: FolderOpen, color: 'text-slate-600', bg: 'bg-slate-50' },
    RESOURCE_REQUEST: { Icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    RESOURCE_APPROVED: { Icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    RESOURCE_RETURNED: { Icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' },
    NGO_VERIFIED: { Icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    NGO_REJECTED: { Icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-50' },
    NGO_UNDER_REVIEW: { Icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    ADMIN_ANNOUNCEMENT: { Icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    MAINTENANCE: { Icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
    POLICY_UPDATE: { Icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
    DEFAULT: { Icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50' },
};

const TAB_TYPES: Record<Tab, string[]> = {
    All: [],
    Social: ['LIKE', 'COMMENT', 'REPOST', 'FOLLOW', 'MENTION'],
    Donations: ['DONATION_RECEIVED', 'DONATION_CONFIRMED', 'DONATION_GOAL_REACHED'],
    Projects: ['PROJECT_APPLICATION', 'PROJECT_ACCEPTED', 'PROJECT_REJECTED', 'PROJECT_CLOSED',
        'RESOURCE_REQUEST', 'RESOURCE_APPROVED', 'RESOURCE_RETURNED'],
    System: ['NGO_VERIFIED', 'NGO_REJECTED', 'NGO_UNDER_REVIEW',
        'ADMIN_ANNOUNCEMENT', 'MAINTENANCE', 'POLICY_UPDATE'],
};

function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const TABS: Tab[] = ['All', 'Social', 'Donations', 'Projects', 'System'];

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, handleMarkAll, handleMarkOne, handleDelete } = useNotifications();
    const [activeTab, setActiveTab] = useState<Tab>('All');

    const displayed = activeTab === 'All'
        ? notifications
        : notifications.filter(n => TAB_TYPES[activeTab].includes(n.type));

    const tabCount = (tab: Tab) => tab === 'All'
        ? notifications.length
        : notifications.filter(n => TAB_TYPES[tab].includes(n.type)).length;

    const onDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        handleDelete(id);
    };

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
                                        {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAll}
                                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                                    >
                                        <Check size={13} /> Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex border-b border-slate-100 px-2 pt-2 overflow-x-auto scrollbar-hide">
                                {TABS.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === tab
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
                                            }`}
                                    >
                                        {tab}
                                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${activeTab === tab ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {tabCount(tab)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="divide-y divide-slate-50">
                                {loading && (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                                    </div>
                                )}

                                {!loading && displayed.length === 0 && (
                                    <div className="text-center py-14">
                                        <Bell size={32} className="mx-auto mb-3 text-slate-200" />
                                        <p className="text-sm font-semibold text-slate-400">No notifications here</p>
                                    </div>
                                )}

                                {!loading && displayed.map((notif: Notification) => {
                                    const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.DEFAULT;
                                    const { Icon, color, bg } = cfg;

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.is_read && handleMarkOne(notif.id)}
                                            className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-slate-50 group ${notif.is_read ? 'bg-white' : 'bg-indigo-50/40'
                                                }`}
                                        >
                                            <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                                                <Icon size={18} className={color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                    <span className="font-bold text-slate-900">{notif.title}</span>
                                                </p>
                                                <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                                                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                                    {timeAgo(notif.created_at)}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {!notif.is_read && (
                                                    <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />
                                                )}
                                                <button
                                                    onClick={(e) => onDelete(e, notif.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-red-500 transition-all font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>

                    <aside className="lg:col-span-4 space-y-4 sticky top-20 self-start">
                        <SiteFooter />
                    </aside>
                </div>
            </div>
        </div>
    );
}