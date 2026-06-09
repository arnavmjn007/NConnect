"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Youtube, Image as ImageIcon, Newspaper, Smile, X, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { createPost } from '@/lib/feedApi';
import { CldUploadWidget } from 'next-cloudinary';

interface Props {
    onPostCreated?: () => void;
}

export default function Postbox({ onPostCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { dbUser, user } = useAuth();

    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const displayName = dbUser?.fullName || user?.name || 'User';
    const initial = displayName.charAt(0).toUpperCase();

    const handleSubmit = async () => {
        if (!content.trim() && !mediaUrls.length) return;
        setSubmitting(true);
        setError('');
        try {
            await createPost({ content: content.trim(), media_urls: mediaUrls });
            setContent('');
            setMediaUrls([]);
            setOpen(false);
            onPostCreated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Post failed');
        } finally {
            setSubmitting(false);
        }
    };

    const actions = [
        { Icon: Youtube, label: 'Video', color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
        { Icon: ImageIcon, label: 'Photo', color: 'text-blue-500', bg: 'hover:bg-blue-50' },
        { Icon: Newspaper, label: 'Article', color: 'text-orange-600', bg: 'hover:bg-orange-50' },
        { Icon: Smile, label: 'Feeling', color: 'text-amber-500', bg: 'hover:bg-amber-50' },
    ] as const;

    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${open ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' : 'border-slate-200'
            }`}>
            <div className="p-4">
                <div className="flex gap-3 items-center">
                    <div className="h-11 w-11 rounded-xl shrink-0 overflow-hidden border border-slate-200">
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt={displayName}
                                width={44}
                                height={44}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-linear-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-sm">
                                {initial}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        readOnly
                        placeholder="Share an update, story, or opportunity..."
                        onClick={() => setOpen(true)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-400 font-medium hover:border-[#0A66C2] hover:bg-slate-50 transition-all text-sm focus:outline-none cursor-pointer"
                    />
                </div>

                {open && (
                    <div className="mt-3 space-y-3">
                        <textarea
                            autoFocus
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to share?"
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]"
                        />
                        {mediaUrls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {mediaUrls.map((url, i) => (
                                    <div key={i} className="relative h-20 w-20">
                                        <Image
                                            src={url}
                                            alt="preview"
                                            fill
                                            className="object-cover rounded-lg border border-slate-200"
                                            sizes="80px"
                                        />
                                        <button
                                            onClick={() => setMediaUrls((p) => p.filter((_, j) => j !== i))}
                                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 z-10"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500">{error}</p>
                        )}

                        <div className="flex items-center justify-between">
                            <CldUploadWidget
                                uploadPreset="nconnect_posts"
                                onSuccess={(result) => {
                                    if (
                                        result.event === 'success' &&
                                        typeof result.info === 'object' &&
                                        result.info &&
                                        'secure_url' in result.info
                                    ) {
                                        setMediaUrls((p) => [
                                            ...p,
                                            (result.info as { secure_url: string }).secure_url,
                                        ]);
                                    }
                                }}
                            >
                                {({ open: openWidget }) => (
                                    <button
                                        type="button"
                                        onClick={() => openWidget()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 rounded-xl text-xs font-semibold text-blue-500 transition-all"
                                    >
                                        <ImageIcon size={15} /> Add Photo
                                    </button>
                                )}
                            </CldUploadWidget>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        setContent('');
                                        setMediaUrls([]);
                                        setError('');
                                    }}
                                    className="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || (!content.trim() && !mediaUrls.length)}
                                    className="px-4 py-1.5 text-xs font-semibold bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {submitting && <Loader2 size={12} className="animate-spin" />}
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!open && (
                <>
                    <div className="border-t border-slate-100 mx-4" />
                    <div className="px-3 py-2 flex items-center justify-between">
                        {actions.map(({ Icon, label, color, bg }) => (
                            <button
                                key={label}
                                onClick={() => setOpen(true)}
                                className={`flex items-center gap-1.5 px-3 py-2 ${bg} rounded-xl transition-all group`}
                            >
                                <Icon
                                    size={18}
                                    className={`${color} transition-transform group-hover:scale-110`}
                                />
                                <span className="text-[12px] font-semibold text-slate-500 group-hover:text-slate-800 hidden sm:inline">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}