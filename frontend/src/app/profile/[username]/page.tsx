"use client";
import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MapPin, Calendar, Briefcase, GraduationCap,
    BadgeCheck, Building2, Globe, Users,
    Check, Loader2, Repeat2, ThumbsUp, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from '@/components/feed/FollowButton';
import SiteFooter from '@/components/ui/SiteFooter';

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

interface Post {
    id: string;
    author_id: string;
    author_name: string;
    author_username: string;
    author_avatar: string | null;
    content: string | null;
    media_urls: string[];
    like_count: number;
    comment_count: number;
    liked_by_me: boolean;
    created_at: string;
    is_edited: boolean;
    post_type: string;
}

function PostCard({ post }: { post: Post }) {
    const timeAgo = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    {post.author_avatar ? (
                        <Image src={post.author_avatar} alt={post.author_name} width={36} height={36}
                            className="rounded-xl object-cover shrink-0" />
                    ) : (
                        <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {post.author_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-bold text-slate-900">{post.author_name}</p>
                        <p className="text-[11px] text-slate-400">
                            {timeAgo}{post.is_edited && ' · Edited'} · 🌐
                        </p>
                    </div>
                </div>

                {post.post_type === 'project_update' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full mb-2">
                        Project Update
                    </span>
                )}
                {post.post_type === 'resource_need' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full mb-2">
                        Resource Need
                    </span>
                )}

                {post.content && (
                    <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                )}
            </div>

            {post.media_urls?.length > 0 && (
                <div className="relative w-full h-64">
                    <Image src={post.media_urls[0]} alt="Post media" fill
                        className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                </div>
            )}

            <div className="px-4 py-2 border-t border-slate-100 flex gap-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
                    <ThumbsUp size={14} /> {post.like_count}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
                    <MessageSquare size={14} /> {post.comment_count}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
                    <Repeat2 size={14} /> Repost
                </div>
            </div>
        </article>
    );
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
        const res = await fetch('/api/feed/feed?page=1');
        if (!res.ok) return [];
        const data = await res.json();
        return (data.posts ?? []).filter((p: Post) => p.author_id === auth0Id);
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

    if (loading) {
        return (
            <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (notFound || !profile) {
        return (
            <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-sm">
                    <Users size={40} className="mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-800">Profile not found</h2>
                    <p className="text-slate-500 text-sm mt-2">@{username} doesn&apos;t exist on NConnect.</p>
                    <Link href="/" className="mt-5 inline-block bg-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = profile.fullName || profile.username || 'User';
    const initial = displayName.charAt(0).toUpperCase();
    const isOwnProfile = currentUser?.sub === profile.auth0Id;
    const isNGO = profile.role === 'NGO';

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-24 bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end justify-between -mt-10 mb-4">
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-200">
                                {profile.profileImageUrl ? (
                                    <Image src={profile.profileImageUrl} alt={displayName}
                                        width={80} height={80} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                                        {initial}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-10">
                                {isOwnProfile ? (
                                    <Link
                                        href="/settings"
                                        className="border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                    >
                                        Edit Profile
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
                                            onClick={() =>
                                                router.push(`/messages?with=${profile.auth0Id}`)
                                            }
                                            className="flex items-center gap-1.5 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                        >
                                            <MessageSquare size={13} />
                                            Message
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    {displayName}
                                    {profile.verified && <BadgeCheck size={20} className="text-indigo-500" />}
                                    {isNGO && (
                                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                            NGO
                                        </span>
                                    )}
                                </h1>
                                {profile.username && (
                                    <p className="text-sm text-slate-400">@{profile.username}</p>
                                )}
                            </div>

                            {isNGO && profile.organizationName && (
                                <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                                    <Building2 size={14} className="text-indigo-500" />
                                    {profile.organizationName}
                                </div>
                            )}

                            {profile.bio && (
                                <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
                            )}
                            {isNGO && profile.missionStatement && (
                                <p className="text-sm text-slate-600 leading-relaxed">{profile.missionStatement}</p>
                            )}

                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {profile.location && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <MapPin size={12} />{profile.location}
                                    </div>
                                )}
                                {profile.occupation && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Briefcase size={12} />{profile.occupation}
                                    </div>
                                )}
                                {profile.education && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <GraduationCap size={12} />{profile.education}
                                    </div>
                                )}
                                {isNGO && profile.operatingLocations && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Globe size={12} />Operating in: {profile.operatingLocations}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Calendar size={12} />Member on NConnect
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100">
                            <div className="text-center">
                                <p className="text-lg font-bold text-indigo-600">{followStats.followingCount}</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Following</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-emerald-600">{followStats.followerCount}</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Followers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {isNGO && profile.ngoCategories && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-slate-900 text-sm mb-3">Focus Areas</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.ngoCategories.split(',').map(c => (
                                <span key={c} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                    {c.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {!isNGO && profile.skills.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-slate-900 text-sm mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => (
                                <span key={skill} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                                    <Check size={10} />{skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {profile.causes.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-slate-900 text-sm mb-3">Causes</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.causes.map(c => (
                                <span key={c} className="text-xs bg-violet-50 text-violet-700 font-semibold px-3 py-1 rounded-full border border-violet-100">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {!isNGO && profile.interests.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-slate-900 text-sm mb-3">Interests</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map(i => (
                                <span key={i} className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-100">
                                    {i}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {profile.languages.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-slate-900 text-sm mb-3">Languages</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.languages.map(l => (
                                <span key={l} className="text-xs bg-slate-50 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200">
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="font-bold text-slate-900 text-sm px-1">
                        Posts by {displayName}
                    </h2>
                    {!postsLoaded ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-slate-400" size={22} />
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                            <p className="text-slate-500 font-semibold text-sm">No posts yet</p>
                            <p className="text-slate-400 text-xs mt-1">
                                {isNGO
                                    ? `${displayName} hasn't shared anything yet.`
                                    : 'No public posts yet.'}
                            </p>
                        </div>
                    )}
                </div>
                <SiteFooter />
            </div>
        </div>
    );
}