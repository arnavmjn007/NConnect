"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Edit3, Briefcase, Check, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SiteFooter from '@/components/ui/SiteFooter';

const tabs = ["following", "applications", "donations", "activity"] as const;
type Tab = typeof tabs[number];

export default function ProfilePage() {
    const { dbUser, user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("following");

    const displayName = dbUser?.fullName || user?.name || "User";
    // const displayEmail = dbUser?.email || user?.email || "";
    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const displayLocation = dbUser?.location || "Location not set";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start gap-5">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                            {displayImage ? (
                                <Image src={displayImage} alt={displayName} width={80} height={80} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-3xl">
                                    {initial}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
                                    {dbUser?.username && (
                                        <p className="text-sm text-slate-400">@{dbUser.username}</p>
                                    )}
                                    {dbUser?.bio && (
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{dbUser.bio}</p>
                                    )}
                                </div>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0"
                                >
                                    <Edit3 size={13} /> Edit Profile
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                                {[
                                    { Icon: MapPin, text: displayLocation },
                                    // { Icon: Mail, text: displayEmail },
                                    { Icon: Calendar, text: `Joined ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` },
                                ].map(({ Icon, text }) => (
                                    <div key={text} className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Icon size={12} className="shrink-0" /> {text}
                                    </div>
                                ))}
                            </div>
                            {dbUser?.occupation && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                                    <Briefcase size={12} className="text-slate-400" />
                                    <span>{dbUser.occupation}</span>
                                </div>
                            )}
                            {dbUser && dbUser.skills.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    {dbUser.skills.map(skill => (
                                        <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { value: 0, label: "Following", color: "text-indigo-600" },
                        { value: 0, label: "Volunteer Applications", color: "text-emerald-600" },
                        { value: 0, label: "Donations Made", color: "text-violet-600" },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100 px-2 pt-2 overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap capitalize ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-5">
                        {activeTab === "following" && (
                            <div className="text-center py-12 text-slate-400">
                                <Check size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-semibold">No NGOs followed yet</p>
                                <p className="text-xs mt-1">NGOs you follow will appear here</p>
                            </div>
                        )}
                        {activeTab === "applications" && (
                            <div className="text-center py-12 text-slate-400">
                                <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-semibold">No applications yet</p>
                            </div>
                        )}
                        {activeTab === "donations" && (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-sm font-semibold">No donations yet</p>
                            </div>
                        )}
                        {activeTab === "activity" && (
                            <div className="text-center py-12 text-slate-400">
                                <Activity size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-semibold">Recent activity will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                    <SiteFooter />
                </div>
            </div>
        </div>
    );
}