"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    MoreHorizontal, X, ThumbsUp, MessageSquare, Repeat2, Send, Heart, Sparkles, Loader2, Check, Link2, Users, BadgeCheck
} from "lucide-react";
import {
    likePost, unlikePost, deletePost, getComments, addComment,
    repost as repostApi, getFollowers, getFollowing, startConversation, getPost
} from '@/lib/feedApi';
import { summarizeText } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

export interface Post {
    id: string;
    author_id: string;
    author_username: string;
    author_name: string;
    author_avatar: string | null;
    content: string | null;
    media_urls: string[];
    like_count: number;
    comment_count: number;
    liked_by_me: boolean;
    created_at: string;
    is_edited: boolean;
    post_type: string;
    original_content?: string;
    original_author_id?: string;
    original_author_username?: string;
    repost_comment?: string;
}

interface CommentItem {
    id: string;
    post_id: string;
    user_id: string;
    parent_comment_id: string | null;
    content: string;
    created_at: string;
    replies?: CommentItem[];
    author_name?: string;
    author_avatar?: string | null;
}

interface RawUser {
    auth0Id: string;
    organizationName?: string;
    fullName?: string;
    username?: string;
    displayName?: string;
    profileImageUrl?: string;
    verified?: boolean;
}

interface ShareTarget {
    auth0Id: string;
    name: string;
    image: string | null;
}

interface Props {
    post: Post;
    currentUserId?: string;
    onDelete?: (id: string) => void;
    onRepost?: (newPost: Post) => void;
}

const SUMMARIZE_THRESHOLD = 200;

async function enrichComments(comments: CommentItem[]): Promise<CommentItem[]> {
    const allIds = new Set<string>();
    comments.forEach(c => {
        allIds.add(c.user_id);
        (c.replies ?? []).forEach(r => allIds.add(r.user_id));
    });

    const profileMap: Record<string, { name: string; image: string | null }> = {};
    await Promise.all([...allIds].map(async (auth0Id) => {
        try {
            const res = await fetch(`/api/users?auth0Id=${encodeURIComponent(auth0Id)}`);
            if (!res.ok) return;
            const users = await res.json();
            const u: RawUser = Array.isArray(users) ? users[0] : users;
            if (u) {
                profileMap[auth0Id] = {
                    name: u.displayName || u.organizationName || u.fullName || u.username || auth0Id,
                    image: u.profileImageUrl || null,
                };
            }
        } catch { /* silent */ }
    }));

    const attach = (c: CommentItem): CommentItem => ({
        ...c,
        author_name: profileMap[c.user_id]?.name ?? c.user_id,
        author_avatar: profileMap[c.user_id]?.image ?? null,
        replies: (c.replies ?? []).map(attach),
    });

    return comments.map(attach);
}

function timeAgo(iso: string) {
    const diffMin = (Date.now() - new Date(iso).getTime()) / 60000;
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${Math.round(diffMin)}m`;
    if (diffMin < 1440) return `${Math.round(diffMin / 60)}h`;
    return new Date(iso).toLocaleDateString();
}

function CommentRow({ comment, depth = 0 }: { comment: CommentItem; depth?: number }) {
    const initial = (comment.author_name || comment.user_id).charAt(0).toUpperCase();
    return (
        <div className={depth > 0 ? "ml-8 mt-2" : "mt-2"}>
            <div className="flex gap-2">
                {comment.author_avatar ? (
                    <Image src={comment.author_avatar} alt={comment.author_name || ''} width={28} height={28}
                        className="rounded-lg object-cover shrink-0 h-7 w-7" />
                ) : (
                    <div className="h-7 w-7 bg-slate-400 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                        {initial}
                    </div>
                )}
                <div className="bg-slate-50 rounded-xl px-3 py-1.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{comment.author_name || comment.user_id}</p>
                    <p className="text-xs text-slate-600 mt-0.5 wrap-break-word">{comment.content}</p>
                </div>
            </div>
            <p className="text-[10px] text-slate-400 ml-9 mt-0.5">{timeAgo(comment.created_at)}</p>
            {comment.replies?.map(r => <CommentRow key={r.id} comment={r} depth={depth + 1} />)}
        </div>
    );
}

export default function PostItem({ post, currentUserId, onDelete, onRepost }: Props) {
    const { sendMessage } = useSocket();

    const [liked, setLiked] = useState(post.liked_by_me);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [busy, setBusy] = useState(false);

    const [authorVerified, setAuthorVerified] = useState(false);

    const [summary, setSummary] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summarizeError, setSummarizeError] = useState(false);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comment_count);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);

    const [reposted, setReposted] = useState(false);
    const [reposting, setReposting] = useState(false);

    const [showSendMenu, setShowSendMenu] = useState(false);
    const [shareTargets, setShareTargets] = useState<ShareTarget[]>([]);
    const [loadingShareTargets, setLoadingShareTargets] = useState(false);
    const [sendingToId, setSendingToId] = useState<string | null>(null);
    const [sentToIds, setSentToIds] = useState<Set<string>>(new Set());
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadVerified() {
            try {
                const res = await fetch(`/api/users?auth0Id=${encodeURIComponent(post.author_id)}`);
                if (!res.ok) return;
                const users = await res.json();
                const u: RawUser | null = Array.isArray(users) ? users[0] : users;
                if (!cancelled && u?.verified) setAuthorVerified(true);
            } catch { /* silent */ }
        }
        loadVerified();
        return () => { cancelled = true; };
    }, [post.author_id]);

    const handleLike = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const data = liked ? await unlikePost(post.id) : await likePost(post.id);
            setLiked(data.liked);
            setLikeCount(data.count);
        } catch (err) {
            console.error(err);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this post?')) return;
        try {
            await deletePost(post.id);
            onDelete?.(post.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSummarize = async () => {
        if (!post.content) return;
        if (summary) {
            setShowSummary(true);
            return;
        }
        setSummarizing(true);
        setSummarizeError(false);
        try {
            const result = await summarizeText(post.content);
            setSummary(result);
            setShowSummary(true);
        } catch (err) {
            console.error(err);
            setSummarizeError(true);
        } finally {
            setSummarizing(false);
        }
    };

    const handleToggleComments = async () => {
        const opening = !showComments;
        setShowComments(opening);
        if (opening && comments.length === 0 && !loadingComments) {
            setLoadingComments(true);
            try {
                const data: CommentItem[] = await getComments(post.id);
                const enriched = await enrichComments(data);
                setComments(enriched);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || postingComment) return;
        setPostingComment(true);
        try {
            const created = await addComment(post.id, newComment.trim());
            const [enrichedNew] = await enrichComments([{ ...created, replies: [] }]);
            setComments(prev => [...prev, enrichedNew]);
            setCommentCount(c => c + 1);
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setPostingComment(false);
        }
    };

    const handleRepost = async () => {
        if (reposting || reposted) return;
        setReposting(true);
        try {
            const created = await repostApi(post.id);
            setReposted(true);
            try {
                const enriched = await getPost(created.id);
                onRepost?.(enriched);
            } catch {
                onRepost?.(created);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setReposting(false);
        }
    };

    const loadShareTargets = async () => {
        if (!currentUserId) return;
        setLoadingShareTargets(true);
        try {
            const [followers, following] = await Promise.all([
                getFollowers(currentUserId).catch(() => []),
                getFollowing(currentUserId).catch(() => []),
            ]);
            const ids = new Set<string>();
            (followers as { follower_id: string }[]).forEach(f => {
                if (f.follower_id !== currentUserId) ids.add(f.follower_id);
            });
            (following as { following_id: string }[]).forEach(f => {
                if (f.following_id !== currentUserId) ids.add(f.following_id);
            });

            const profiles = await Promise.all([...ids].map(async (auth0Id) => {
                try {
                    const res = await fetch(`/api/users?auth0Id=${encodeURIComponent(auth0Id)}`);
                    if (!res.ok) return null;
                    const users = await res.json();
                    const u: RawUser = Array.isArray(users) ? users[0] : null;
                    if (!u) return null;
                    return {
                        auth0Id,
                        name: u.displayName || u.organizationName || u.fullName || u.username || auth0Id,
                        image: u.profileImageUrl || null,
                    } as ShareTarget;
                } catch { return null; }
            }));

            setShareTargets(profiles.filter((p): p is ShareTarget => p !== null));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingShareTargets(false);
        }
    };

    const handleToggleSend = () => {
        const opening = !showSendMenu;
        setShowSendMenu(opening);
        if (opening && shareTargets.length === 0 && !loadingShareTargets) {
            loadShareTargets();
        }
    };

    const handleSendToUser = async (targetId: string) => {
        if (sendingToId) return;
        setSendingToId(targetId);
        try {
            const conv = await startConversation(targetId);
            const link = `${window.location.origin}/profile/${post.author_username}`;
            const text = `Check out this post from @${post.author_username}: ${link}`;
            sendMessage(conv.id, text);
            setSentToIds(prev => new Set(prev).add(targetId));
        } catch (err) {
            console.error(err);
        } finally {
            setSendingToId(null);
        }
    };

    const handleCopyLink = async () => {
        try {
            const url = `${window.location.origin}/profile/${post.author_username}`;
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const isOwner = currentUserId && post.author_id === currentUserId;
    const timeLabel = new Date(post.created_at).toLocaleDateString();
    const canSummarize = !!post.content && post.content.length > SUMMARIZE_THRESHOLD;

    const actions = [
        { icon: ThumbsUp, label: 'Like', active: liked, color: 'hover:text-[#0A66C2]', activeColor: 'text-[#0A66C2]', onClick: handleLike, disabled: busy },
        { icon: MessageSquare, label: 'Comment', active: showComments, color: 'hover:text-emerald-600', activeColor: 'text-emerald-600', onClick: handleToggleComments, disabled: false },
        { icon: reposted ? Check : Repeat2, label: reposted ? 'Reposted' : 'Repost', active: reposted, color: 'hover:text-orange-500', activeColor: 'text-orange-500', onClick: handleRepost, disabled: reposting || reposted },
        { icon: Send, label: 'Send', active: showSendMenu, color: 'hover:text-blue-500', activeColor: 'text-blue-500', onClick: handleToggleSend, disabled: false },
    ];

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group w-full">
            <div className="p-3 sm:p-4 flex justify-between items-start gap-2">
                <div className="flex gap-2.5 sm:gap-3 min-w-0">
                    {post.author_avatar ? (
                        <Image
                            src={post.author_avatar}
                            alt={post.author_name}
                            width={44}
                            height={44}
                            className="rounded-xl object-cover shrink-0 h-10 w-10 sm:h-11 sm:w-11"
                        />
                    ) : (
                        <div className="h-10 w-10 sm:h-11 sm:w-11 bg-linear-to-br from-slate-600 to-slate-800 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm">
                            {post.author_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 hover:text-[#0A66C2] cursor-pointer transition-colors truncate flex items-center gap-1">
                            {post.author_name}
                            {authorVerified && (
                                <BadgeCheck size={14} className="text-indigo-500 shrink-0" />
                            )}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            @{post.author_username} · {timeLabel}{post.is_edited && ' · Edited'} · 🌐
                        </p>
                    </div>
                </div>
                {isOwner && (
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                            <MoreHorizontal size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {post.post_type === 'repost' && post.original_content && (
                <div className="mx-3 sm:mx-4 mb-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    {post.repost_comment && (
                        <p className="text-sm text-slate-800 mb-2">{post.repost_comment}</p>
                    )}
                    <p className="text-xs text-slate-400 mb-1 truncate">
                        ↩ @{post.original_author_username ?? post.original_author_id}
                    </p>
                    <p className="text-sm text-slate-600 italic">{post.original_content}</p>
                </div>
            )}

            {post.content && (
                <div className="px-3 sm:px-4 pb-3 space-y-2">
                    {showSummary && summary ? (
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 space-y-1.5">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={11} /> AI Summary
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                Show original
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap wrap-break-word">{post.content}</p>
                    )}

                    {canSummarize && !showSummary && (
                        <button
                            onClick={handleSummarize}
                            disabled={summarizing}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                        >
                            {summarizing ? (
                                <>
                                    <Loader2 size={11} className="animate-spin" /> Summarizing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={11} /> Summarize
                                </>
                            )}
                        </button>
                    )}
                    {summarizeError && (
                        <p className="text-[11px] text-red-500">Couldn&apos;t summarize right now. Try again later.</p>
                    )}
                </div>
            )}

            {post.media_urls?.length > 0 && (
                <div className="mx-3 sm:mx-4 mb-3 rounded-xl overflow-hidden relative w-auto h-56 sm:h-72 md:h-80">
                    <Image
                        src={post.media_urls[0]}
                        alt="Post media"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                    />
                </div>
            )}

            <div className="px-3 sm:px-4 pb-2 flex items-center justify-between text-[11px] text-slate-400 gap-2">
                <div className="flex items-center gap-1 shrink-0">
                    <span className="h-4 w-4 bg-[#0A66C2] rounded-full flex items-center justify-center">
                        <Heart size={9} className="text-white fill-white" />
                    </span>
                    <span>{likeCount} reactions</span>
                </div>
                <button
                    onClick={handleToggleComments}
                    className="cursor-pointer hover:underline hover:text-slate-700 transition-colors shrink-0"
                >
                    {commentCount} comments
                </button>
            </div>

            <div className="border-t border-slate-100 px-1 sm:px-2 py-1 flex">
                {actions.map(({ icon: Icon, label, active, color, activeColor, onClick, disabled }) => (
                    <button
                        key={label}
                        onClick={onClick}
                        disabled={disabled}
                        className={`flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl transition-all text-xs font-semibold hover:bg-slate-50 disabled:opacity-60
              ${active ? activeColor : `text-slate-500 ${color}`}`}
                    >
                        <Icon size={16} className={active ? 'fill-current' : ''} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {showComments && (
                <div className="border-t border-slate-100 px-3 sm:px-4 py-3 bg-slate-50/50">
                    {loadingComments ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-slate-300" size={18} />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No comments yet. Be the first to comment.</p>
                    ) : (
                        <div className="space-y-1 mb-3 max-h-72 overflow-y-auto">
                            {comments.map(c => <CommentRow key={c.id} comment={c} />)}
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                            placeholder="Write a comment..."
                            className="flex-1 min-w-0 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-all"
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || postingComment}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center gap-1"
                        >
                            {postingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        </button>
                    </div>
                </div>
            )}

            {showSendMenu && (
                <div className="border-t border-slate-100 px-3 sm:px-4 py-3 bg-slate-50/50">
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 px-3 py-2 mb-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                    >
                        {linkCopied ? <Check size={14} className="text-emerald-500" /> : <Link2 size={14} />}
                        {linkCopied ? 'Link copied!' : 'Copy link to profile'}
                    </button>

                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Send to a follower or following
                    </p>

                    {!currentUserId ? (
                        <p className="text-xs text-slate-400 text-center py-3">Log in to send posts to people.</p>
                    ) : loadingShareTargets ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-slate-300" size={18} />
                        </div>
                    ) : shareTargets.length === 0 ? (
                        <div className="text-center py-4">
                            <Users size={22} className="mx-auto mb-1.5 text-slate-300" />
                            <p className="text-xs text-slate-400">No followers or following to send to yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                            {shareTargets.map(t => {
                                const isSending = sendingToId === t.auth0Id;
                                const isSent = sentToIds.has(t.auth0Id);
                                return (
                                    <div key={t.auth0Id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white transition-colors">
                                        {t.image ? (
                                            <Image src={t.image} alt={t.name} width={30} height={30}
                                                className="h-7.5 w-7.5 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <div className="h-7.5 w-7.5 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                {t.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-xs font-semibold text-slate-700 flex-1 min-w-0 truncate">{t.name}</span>
                                        <button
                                            onClick={() => handleSendToUser(t.auth0Id)}
                                            disabled={isSending || isSent}
                                            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1 ${isSent
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 disabled:opacity-60'
                                                }`}
                                        >
                                            {isSending ? (
                                                <Loader2 size={11} className="animate-spin" />
                                            ) : isSent ? (
                                                <>
                                                    <Check size={11} /> Sent
                                                </>
                                            ) : (
                                                'Send'
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}