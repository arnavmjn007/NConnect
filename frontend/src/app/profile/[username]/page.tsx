"use client";
import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MapPin, Calendar, Briefcase, GraduationCap,
    BadgeCheck, Globe, Users,
    Check, Loader2, MessageSquare, Edit3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from '@/components/feed/FollowButton';
import SiteFooter from '@/components/ui/SiteFooter';
import PostItem, { Post } from '@/components/feed/PostItem';

interface PublicProfile {
    id: string;
    auth0Id: string;
    username: string;
    fullName: string | null;
    bio: string | null;
    role: 'USER' | 'NGO' | 'ADMIN';
    location: string | null;
    occupation: string | null;
    education: string | null;
    profileImageUrl: string | null;
    skills: string[];
    interests: string[];
    causes: string[];
    languages: string[];
    organizationName: string | null;
    missionStatement: string | null;
    ngoCategories: string | null;
    operatingLocations: string | null;
    verificationStatus: string | null;
    verified: boolean;
}

interface FollowStats {
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
}

async function loadFollowStats(auth0Id: string): Promise<FollowStats> {
    try {
        const res = await fetch(`/api/follow/${encodeURIComponent(auth0Id)}/counts`);
        if (!res.ok) return { followerCount: 0, followingCount: 0, isFollowing: false };
        return res.json();
    } catch {
        return { followerCount: 0, followingCount: 0, isFollowing: false };
    }
}

async function loadUserPosts(auth0Id: string): Promise<Post[]> {
    try {
        const res = await fetch(`/api/feed/posts/user/${encodeURIComponent(auth0Id)}?page=1`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.posts ?? [];
    } catch {
        return [];
    }
}

export default function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = use(params);
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [followStats, setFollowStats] = useState<FollowStats>({
        followerCount: 0,
        followingCount: 0,
        isFollowing: false,
    });
    const [followLoaded, setFollowLoaded] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoaded, setPostsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!username) return;
        let cancelled = false;
        async function fetchProfile() {
            try {
                const r = await fetch(`/api/users/${username}`);
                if (r.status === 404) {
                    if (!cancelled) setNotFound(true);
                    return;
                }
                if (r.ok) {
                    const data = await r.json();
                    if (!cancelled) setProfile(data);
                }
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchProfile();
        return () => { cancelled = true; };
    }, [username]);

    useEffect(() => {
        if (!profile?.auth0Id) return;
        let cancelled = false;
        const auth0Id = profile.auth0Id;
        async function fetchFollow() {
            const data = await loadFollowStats(auth0Id);
            if (!cancelled) {
                setFollowStats(data);
                setFollowLoaded(true);
            }
        }
        fetchFollow();
        return () => { cancelled = true; };
    }, [profile?.auth0Id]);

    useEffect(() => {
        if (!profile?.auth0Id) return;
        let cancelled = false;
        const auth0Id = profile.auth0Id;
        async function fetchPosts() {
            try {
                const data = await loadUserPosts(auth0Id);
                if (!cancelled) setPosts(data);
            } catch {
                if (!cancelled) setPosts([]);
            } finally {
                if (!cancelled) setPostsLoaded(true);
            }
        }
        fetchPosts();
        return () => { cancelled = true; };
    }, [profile?.auth0Id]);

    const handlePostDeleted = (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    if (loading) {
        return (
            <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (notFound || !profile) {
        return (
            <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-sm w-full">
                    <Users size={40} className="mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-800">Profile not found</h2>
                    <p className="text-slate-500 text-sm mt-2">@{username} doesn&apos;t exist on NConnect.</p>
                    <Link href="/" className="mt-5 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const isNGO = profile.role === 'NGO';
    const displayName = isNGO
        ? (profile.organizationName || profile.username || 'Organization')
        : (profile.fullName || profile.username || 'User');
    const initial = displayName.charAt(0).toUpperCase();
    const isOwnProfile = currentUser?.sub === profile.auth0Id;

    const stats = [
        { value: followStats.followingCount, label: "Following", color: "text-indigo-600" },
        { value: followStats.followerCount, label: "Followers", color: "text-emerald-600" },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 text-center sm:text-left">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                            {profile.profileImageUrl ? (
                                <Image src={profile.profileImageUrl} alt={displayName} width={80} height={80} className="h-full w-full object-cover" />
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
                                        {profile.verified && <BadgeCheck size={18} className="text-indigo-500 inline-block" />}
                                        {isNGO && (
                                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full inline-block">NGO</span>
                                        )}
                                    </h1>
                                    {profile.username && (
                                        <p className="text-sm text-slate-400">@{profile.username}</p>
                                    )}
                                    {profile.bio && (
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed wrap-break-word">{profile.bio}</p>
                                    )}
                                    {isNGO && profile.missionStatement && (
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed wrap-break-word">{profile.missionStatement}</p>
                                    )}
                                </div>

                                <div className="w-full sm:w-auto flex items-center justify-center gap-2 shrink-0 mt-2 sm:mt-0">
                                    {isOwnProfile ? (
                                        <Link
                                            href="/settings"
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2.5 sm:py-2 rounded-xl transition-all"
                                        >
                                            <Edit3 size={13} /> Edit Profile
                                        </Link>
                                    ) : (
                                        <>
                                            {!followLoaded ? (
                                                <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
                                            ) : (
                                                <FollowButton
                                                    targetAuth0Id={profile.auth0Id}
                                                    initialFollowing={followStats.isFollowing}
                                                    onFollowChange={(f) =>
                                                        setFollowStats(prev => ({
                                                            ...prev,
                                                            isFollowing: f,
                                                            followerCount: f
                                                                ? prev.followerCount + 1
                                                                : Math.max(0, prev.followerCount - 1),
                                                        }))
                                                    }
                                                    size="md"
                                                />
                                            )}
                                            <button
                                                onClick={() => router.push(`/messages?with=${profile.auth0Id}`)}
                                                className="flex items-center gap-1.5 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2.5 sm:py-2 rounded-xl transition-all"
                                            >
                                                <MessageSquare size={13} /> Message
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-4 sm:mt-3">
                                {profile.location && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <MapPin size={12} className="shrink-0" /> {profile.location}
                                    </div>
                                )}
                                {profile.occupation && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Briefcase size={12} className="shrink-0" /> {profile.occupation}
                                    </div>
                                )}
                                {profile.education && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <GraduationCap size={12} className="shrink-0" /> {profile.education}
                                    </div>
                                )}
                                {isNGO && profile.operatingLocations && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Globe size={12} className="shrink-0" /> {profile.operatingLocations}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Calendar size={12} className="shrink-0" /> Member on NConnect
                                </div>
                            </div>

                            {!isNGO && profile.skills.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3.5 sm:mt-3">
                                    {profile.skills.map(skill => (
                                        <span key={skill} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                            <Check size={10} /> {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {isNGO && profile.ngoCategories && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3.5 sm:mt-3">
                                    {profile.ngoCategories.split(',').map(c => (
                                        <span key={c} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                            {c.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {profile.causes.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {profile.causes.map(c => (
                                        <span key={c} className="text-xs bg-violet-50 text-violet-700 font-semibold px-3 py-1 rounded-full border border-violet-100">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {!isNGO && profile.interests.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {profile.interests.map(i => (
                                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-100">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {profile.languages.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {profile.languages.map(l => (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 text-center flex sm:flex-col items-center sm:justify-center justify-between gap-2 sm:gap-0">
                            <p className="text-xs text-slate-500 order-2 sm:order-0 mt-0 sm:mt-1 leading-tight text-left sm:text-center">{s.label}</p>
                            <p className={`text-2xl sm:text-3xl font-bold order-1 sm:order-0 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="px-1 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 text-sm">
                            Posts by {displayName}
                        </h2>
                    </div>

                    {!postsLoaded ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex justify-center">
                            <Loader2 className="animate-spin text-slate-300" size={24} />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                            <p className="text-sm font-semibold">No posts yet</p>
                            <p className="text-xs mt-1">
                                {isNGO ? `${displayName} hasn't shared anything yet.` : 'No public posts yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map(post => (
                                <PostItem
                                    key={post.id}
                                    post={post}
                                    currentUserId={currentUser?.sub}
                                    onDelete={handlePostDeleted}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <SiteFooter />
            </div>
        </div>
    );
}