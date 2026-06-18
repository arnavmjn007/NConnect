"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { MoreHorizontal, X, ThumbsUp, MessageSquare, Repeat2, Send, Heart } from "lucide-react";
import { likePost, unlikePost, deletePost } from '@/lib/feedApi';

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

interface Props {
    post: Post;
    currentUserId?: string;
    onDelete?: (id: string) => void;
}

export default function PostItem({ post, currentUserId, onDelete }: Props) {
    const [liked, setLiked] = useState(post.liked_by_me);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [busy, setBusy] = useState(false);

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

    const isOwner = currentUserId && post.author_id === currentUserId;
    const timeAgo = new Date(post.created_at).toLocaleDateString();

    const actions = [
        { icon: ThumbsUp, label: 'Like', active: liked, color: 'hover:text-[#0A66C2]', activeColor: 'text-[#0A66C2]', onClick: handleLike },
        { icon: MessageSquare, label: 'Comment', active: false, color: 'hover:text-emerald-600', activeColor: 'text-emerald-600', onClick: undefined },
        { icon: Repeat2, label: 'Repost', active: false, color: 'hover:text-orange-500', activeColor: 'text-orange-500', onClick: undefined },
        { icon: Send, label: 'Send', active: false, color: 'hover:text-blue-500', activeColor: 'text-blue-500', onClick: undefined },
    ] as const;

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                    {post.author_avatar ? (
                        <Image
                            src={post.author_avatar}
                            alt={post.author_name}
                            width={44}
                            height={44}
                            className="rounded-xl object-cover shrink-0"
                        />
                    ) : (
                        <div className="h-11 w-11 bg-linear-to-br from-slate-600 to-slate-800 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm">
                            {post.author_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 hover:text-[#0A66C2] cursor-pointer transition-colors">
                            {post.author_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            @{post.author_username} · {timeAgo}{post.is_edited && ' · Edited'} · 🌐
                        </p>
                    </div>
                </div>
                {isOwner && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <div className="mx-4 mb-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    {post.repost_comment && (
                        <p className="text-sm text-slate-800 mb-2">{post.repost_comment}</p>
                    )}
                    <p className="text-xs text-slate-400 mb-1">
                        ↩ @{post.original_author_username ?? post.original_author_id}
                    </p>
                    <p className="text-sm text-slate-600 italic">{post.original_content}</p>
                </div>
            )}

            {post.content && (
                <div className="px-4 pb-3">
                    <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                </div>
            )}

            {post.media_urls?.length > 0 && (
                <div className="mx-4 mb-3 rounded-xl overflow-hidden relative w-auto h-80">
                    <Image
                        src={post.media_urls[0]}
                        alt="Post media"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                    />
                </div>
            )}

            <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                    <span className="h-4 w-4 bg-[#0A66C2] rounded-full flex items-center justify-center">
                        <Heart size={9} className="text-white fill-white" />
                    </span>
                    <span>{likeCount} reactions</span>
                </div>
                <span className="cursor-pointer hover:underline hover:text-slate-700 transition-colors">
                    {post.comment_count} comments
                </span>
            </div>

            <div className="border-t border-slate-100 px-2 py-1 flex">
                {actions.map(({ icon: Icon, label, active, color, activeColor, onClick }) => (
                    <button
                        key={label}
                        onClick={onClick}
                        className={`flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl transition-all text-xs font-semibold hover:bg-slate-50
              ${active ? activeColor : `text-slate-500 ${color}`}`}
                    >
                        <Icon size={16} className={active ? 'fill-current' : ''} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>
        </article>
    );
}