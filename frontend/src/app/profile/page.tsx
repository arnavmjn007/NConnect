"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MapPin, Calendar, Edit3, Briefcase, Check,
    Activity, GraduationCap, Heart, Globe,
    Loader2, Users, DollarSign, BadgeCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SiteFooter from '@/components/ui/SiteFooter';
import PostItem, { Post } from '@/components/feed/PostItem';

const tabs = ["posts", "following", "applications", "donations", "activity"] as const;
type Tab = typeof tabs[number];

interface FollowingUser {
    following_id: string;
    name?: string;
    image?: string;
    username?: string;
}

interface Application {
    id: string;
    projectId: string;
    projectTitle: string;
    projectCategory: string;
    ngoName: string;
    status: string;
    createdAt: string;
}

interface Donation {
    id: string;
    projectTitle?: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
};

export default function ProfilePage() {
    const { dbUser, user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("posts");

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [following, setFollowing] = useState<FollowingUser[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);

    const [loadingFollowing, setLoadingFollowing] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [loadingDonations, setLoadingDonations] = useState(false);
    const [loadingActivity, setLoadingActivity] = useState(false);

    const [followingCount, setFollowingCount] = useState(0);

    const isNGO = dbUser?.role === 'NGO';
    const displayName = isNGO
        ? (dbUser?.organizationName || dbUser?.username || "Organization")
        : (dbUser?.fullName || user?.name || "User");
    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const displayLocation = dbUser?.location || null;
    const initial = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!user?.sub) return;
        setLoadingPosts(true);
        async function load() {
            try {
                const res = await fetch(`/api/feed/posts/user/${encodeURIComponent(user!.sub)}?page=1`);
                if (!res.ok) { setPosts([]); return; }
                const data = await res.json();
                setPosts(data.posts ?? []);
            } catch { setPosts([]); }
            finally { setLoadingPosts(false); }
        }
        load();
    }, [user, user?.sub]);

    const handlePostDeleted = (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    useEffect(() => {
        if (!user?.sub) return;
        setLoadingFollowing(true);
        async function load() {
            try {
                const res = await fetch(`/api/feed/following/${encodeURIComponent(user!.sub)}`);
                if (!res.ok) { setFollowing([]); return; }
                const data: FollowingUser[] = await res.json();
                setFollowingCount(data.length);
                const enriched = await Promise.all(
                    data.map(async (f) => {
                        try {
                            const r = await fetch(`/api/users?auth0Id=${encodeURIComponent(f.following_id)}`);
                            if (!r.ok) return f;
                            const users = await r.json();
                            const u = Array.isArray(users) ? users[0] : null;
                            if (!u) return f;
                            return {
                                ...f,
                                name: u.displayName || u.organizationName || u.fullName || u.username || f.following_id,
                                image: u.profileImageUrl || null,
                                username: u.username || null,
                            };
                        } catch { return f; }
                    })
                );
                setFollowing(enriched);
            } catch { setFollowing([]); }
            finally { setLoadingFollowing(false); }
        }
        load();
    }, [user, user?.sub]);

    useEffect(() => {
        setLoadingApplications(true);
        async function load() {
            try {
                const res = await fetch('/api/volunteer/my');
                if (!res.ok) { setApplications([]); return; }
                setApplications(await res.json());
            } catch { setApplications([]); }
            finally { setLoadingApplications(false); }
        }
        load();
    }, []);

    useEffect(() => {
        setLoadingDonations(true);
        async function load() {
            try {
                const res = await fetch('/api/user/my-donations');
                if (!res.ok) { setDonations([]); return; }
                setDonations(await res.json());
            } catch { setDonations([]); }
            finally { setLoadingDonations(false); }
        }
        load();
    }, []);

    useEffect(() => {
        setLoadingActivity(true);
        async function load() {
            try {
                const res = await fetch('/api/feed/notifications?page=1');
                if (!res.ok) { setActivity([]); return; }
                const data = await res.json();
                setActivity(data.notifications ?? data ?? []);
            } catch { setActivity([]); }
            finally { setLoadingActivity(false); }
        }
        load();
    }, []);

    const stats = [
        { value: followingCount, label: "Following", color: "text-indigo-600" },
        { value: applications.length, label: "Volunteer Applications", color: "text-emerald-600" },
        { value: donations.length, label: "Donations Made", color: "text-violet-600" },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 text-center sm:text-left">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                            {displayImage ? (
                                <Image src={displayImage} alt={displayName} width={80} height={80} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-3xl">
                                    {initial}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-4">
                                <div className="w-full">
                                    <h1 className="text-xl font-bold text-slate-900 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        {displayName}
                                        {dbUser?.verified && <BadgeCheck size={18} className="text-indigo-500 inline-block" />}
                                        {isNGO && (
                                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full inline-block">NGO</span>
                                        )}
                                    </h1>
                                    {dbUser?.username && (
                                        <p className="text-sm text-slate-400">@{dbUser.username}</p>
                                    )}
                                    {dbUser?.bio && (
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed wrap-break-word">{dbUser.bio}</p>
                                    )}
                                    {isNGO && dbUser?.missionStatement && (
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed wrap-break-word">{dbUser.missionStatement}</p>
                                    )}
                                </div>
                                <Link
                                    href="/settings"
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2.5 sm:py-2 rounded-xl transition-all shrink-0 mt-2 sm:mt-0"
                                >
                                    <Edit3 size={13} /> Edit Profile
                                </Link>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-4 sm:mt-3">
                                {displayLocation && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <MapPin size={12} className="shrink-0" /> {displayLocation}
                                    </div>
                                )}
                                {dbUser?.occupation && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Briefcase size={12} className="shrink-0" /> {dbUser.occupation}
                                    </div>
                                )}
                                {dbUser?.education && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <GraduationCap size={12} className="shrink-0" /> {dbUser.education}
                                    </div>
                                )}
                                {isNGO && dbUser?.operatingLocations && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Globe size={12} className="shrink-0" /> {dbUser.operatingLocations}
                                    </div>
                                )}
                                {dbUser?.createdAt && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Calendar size={12} className="shrink-0" />
                                        Joined {new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </div>
                                )}
                            </div>

                            {!isNGO && dbUser && dbUser.skills.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3.5 sm:mt-3">
                                    {dbUser.skills.map(skill => (
                                        <span key={skill} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                            <Check size={10} /> {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {isNGO && dbUser?.ngoCategories && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3.5 sm:mt-3">
                                    {dbUser.ngoCategories.split(',').map(c => (
                                        <span key={c} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                            {c.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {dbUser && dbUser.causes.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {dbUser.causes.map(c => (
                                        <span key={c} className="text-xs bg-violet-50 text-violet-700 font-semibold px-3 py-1 rounded-full border border-violet-100">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {!isNGO && dbUser && dbUser.interests.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {dbUser.interests.map(i => (
                                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-100">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {dbUser && dbUser.languages.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {dbUser.languages.map(l => (
                                        <span key={l} className="text-xs bg-slate-50 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200">
                                            {l}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 text-center flex sm:flex-col items-center sm:justify-center justify-between gap-2 sm:gap-0">
                            <p className="text-xs text-slate-500 order-2 sm:order-0 mt-0 sm:mt-1 leading-tight text-left sm:text-center">{s.label}</p>
                            <p className={`text-2xl sm:text-3xl font-bold order-1 sm:order-0 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs & Content */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100 px-2 pt-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap capitalize ${activeTab === tab
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                {tab === "posts" ? `Posts (${posts.length})` :
                                    tab === "applications" ? `Applications (${applications.length})` :
                                        tab === "donations" ? `Donations (${donations.length})` :
                                            tab === "following" ? `Following (${followingCount})` :
                                                "Activity"}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 md:p-5">
                        {activeTab === "posts" && (
                            loadingPosts ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-slate-300" size={24} />
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-sm font-semibold">No posts yet</p>
                                    <p className="text-xs mt-1">Your posts will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {posts.map(post => (
                                        <PostItem
                                            key={post.id}
                                            post={post}
                                            currentUserId={user?.sub}
                                            onDelete={handlePostDeleted}
                                        />
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "following" && (
                            loadingFollowing ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-slate-300" size={24} />
                                </div>
                            ) : following.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Users size={36} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-semibold">Not following anyone yet</p>
                                    <p className="text-xs mt-1">People and NGOs you follow will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {following.map(f => (
                                        <div key={f.following_id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {f.image ? (
                                                    <Image src={f.image} alt={f.name || ''} width={40} height={40} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                                                ) : (
                                                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {(f.name || f.following_id).charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{f.name || f.following_id}</p>
                                                    {f.username && <p className="text-xs text-slate-400 truncate">@{f.username}</p>}
                                                </div>
                                            </div>
                                            {f.username && (
                                                <Link href={`/profile/${f.username}`}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl transition-all shrink-0">
                                                    View
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "applications" && (
                            loadingApplications ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-slate-300" size={24} />
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-semibold">No applications yet</p>
                                    <p className="text-xs mt-1">Your volunteer applications will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {applications.map(app => (
                                        <div key={app.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-800 wrap-break-word">{app.projectTitle}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 wrap-break-word">{app.ngoName} · {app.projectCategory}</p>
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <span className={`self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusColors[app.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "donations" && (
                            loadingDonations ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-slate-300" size={24} />
                                </div>
                            ) : donations.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Heart size={36} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-semibold">No donations yet</p>
                                    <p className="text-xs mt-1">Your donation history will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {donations.map(d => (
                                        <div key={d.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={14} className="text-violet-500 shrink-0" />
                                                        <p className="text-sm font-bold text-slate-800">
                                                            {d.currency} {d.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {d.projectTitle && (
                                                        <p className="text-xs text-slate-500 mt-0.5 wrap-break-word">{d.projectTitle}</p>
                                                    )}
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <span className={`self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusColors[d.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {d.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "activity" && (
                            loadingActivity ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-slate-300" size={24} />
                                </div>
                            ) : activity.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Activity size={36} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-semibold">No recent activity</p>
                                    <p className="text-xs mt-1">Your recent activity will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activity.slice(0, 20).map(a => (
                                        <div key={a.id} className={`p-4 border rounded-xl transition-colors ${a.isRead ? 'border-slate-100 bg-white' : 'border-indigo-100 bg-indigo-50/40'}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${a.isRead ? 'bg-slate-300' : 'bg-indigo-500'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 wrap-break-word">{a.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 wrap-break-word">{a.message}</p>
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                <SiteFooter />
            </div>
        </div>
    );
}