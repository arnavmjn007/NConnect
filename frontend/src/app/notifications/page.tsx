"use client";
import React, { useState, useMemo } from 'react';
import {
    ThumbsUp, MessageSquare, UserPlus, DollarSign,
    Bell, Check, Repeat2, Trash2,
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

const TAB_TYPES: Record<Exclude<Tab, 'All'>, string[]> = {
    Social: ['LIKE', 'COMMENT', 'REPOST', 'FOLLOW', 'MENTION'],
    Donations: ['DONATION_RECEIVED', 'DONATION_CONFIRMED', 'DONATION_GOAL_REACHED'],
    Projects: ['PROJECT_APPLICATION', 'PROJECT_ACCEPTED', 'PROJECT_REJECTED', 'PROJECT_CLOSED', 'RESOURCE_REQUEST', 'RESOURCE_APPROVED', 'RESOURCE_RETURNED'],
    System: ['NGO_VERIFIED', 'NGO_REJECTED', 'NGO_UNDER_REVIEW', 'ADMIN_ANNOUNCEMENT', 'MAINTENANCE', 'POLICY_UPDATE'],
};

const TABS: Tab[] = ['All', 'Social', 'Donations', 'Projects', 'System'];

function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, handleMarkAll, handleMarkOne, handleDelete } = useNotifications();
    const [activeTab, setActiveTab] = useState<Tab>('All');

    // Memorize computations to keep UI fluid and eliminate recalculating on alternate state toggles
    const counts = useMemo(() => {
        const result: Record<Tab, number> = { All: notifications.length, Social: 0, Donations: 0, Projects: 0, System: 0 };
        notifications.forEach(n => {
            if (TAB_TYPES.Social.includes(n.type)) result.Social++;
            else if (TAB_TYPES.Donations.includes(n.type)) result.Donations++;
            else if (TAB_TYPES.Projects.includes(n.type)) result.Projects++;
            else if (TAB_TYPES.System.includes(n.type)) result.System++;
        });
        return result;
    }, [notifications]);

    const displayed = useMemo(() => {
        if (activeTab === 'All') return notifications;
        return notifications.filter(n => TAB_TYPES[activeTab].includes(n.type));
    }, [notifications, activeTab]);

    const onDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        handleDelete(id);
    };

    return (
        <div className="bg-[#F4F2EE] min-h-screen transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                    <main className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                        You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAll}
                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    <Check size={14} className="stroke-3" /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="flex border-b border-slate-100 px-3 pt-2 overflow-x-auto scrollbar-none no-scrollbar">
                                {TABS.map(tab => {
                                    const isActive = activeTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all -mb-px whitespace-nowrap outline-none ${isActive
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
                                                }`}
                                        >
                                            {tab}
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {counts[tab]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="divide-y divide-slate-100">
                                {loading && (
                                    <div className="flex justify-center items-center py-16">
                                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-200 border-t-indigo-600" />
                                    </div>
                                )}

                                {!loading && displayed.length === 0 && (
                                    <div className="text-center py-16 px-4">
                                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bell size={22} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">All caught up!</p>
                                        <p className="text-xs text-slate-400 mt-0.5">No notifications found under {activeTab}.</p>
                                    </div>
                                )}

                                {!loading && displayed.map((notif: Notification) => {
                                    const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.DEFAULT;
                                    const { Icon, color, bg } = cfg;

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.is_read && handleMarkOne(notif.id)}
                                            className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-all duration-150 group relative ${notif.is_read ? 'bg-white hover:bg-slate-50/50' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
                                                }`}
                                        >
                                            <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5`}>
                                                <Icon size={18} className={color} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <p className="text-sm text-slate-800 leading-snug">
                                                        <span className="font-bold text-slate-900">{notif.title}</span>
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                                                        {timeAgo(notif.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed wrap-break-word">{notif.message}</p>
                                            </div>

                                            <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-10">
                                                <div className="h-2 w-2 flex items-center justify-center">
                                                    {!notif.is_read && (
                                                        <span className="h-2 w-2 bg-indigo-600 rounded-full ring-4 ring-indigo-100" />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => onDelete(e, notif.id)}
                                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 p-1 -mr-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 text-[11px] font-medium"
                                                    title="Remove notification"
                                                >
                                                    <Trash2 size={12} />
                                                    <span className="sr-only sm:not-sr-only">Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>

                    <aside className="lg:col-span-4 sticky top-6 self-start w-full">
                        <SiteFooter />
                    </aside>

                </div>
            </div>
        </div>
    );
}