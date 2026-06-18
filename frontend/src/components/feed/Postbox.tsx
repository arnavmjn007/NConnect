"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import {
    Image as ImageIcon, Video, FolderKanban, HandHelping,
    X, Loader2, ChevronDown
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { createPost } from '@/lib/feedApi';
import { CldUploadWidget } from 'next-cloudinary';

type PostType = 'regular' | 'project_update' | 'resource_need';

interface Props {
    onPostCreated?: () => void;
}

const POST_TYPES: { type: PostType; label: string; color: string; bg: string; border: string; placeholder: string }[] = [
    {
        type: 'regular',
        label: 'Post',
        color: 'text-[#0A66C2]',
        bg: 'bg-blue-50',
        border: 'border-[#0A66C2]',
        placeholder: 'What do you want to share?',
    },
    {
        type: 'project_update',
        label: 'Project Update',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-500',
        placeholder: 'Share a project update...\n\nE.g. Education Tour Project\n120 students reached this week.',
    },
    {
        type: 'resource_need',
        label: 'Resource Need',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        placeholder: 'Describe what you need...\n\nE.g. Need 20 blankets\nNeed projector for 3 days\nNeed volunteer photographer',
    },
];

export default function Postbox({ onPostCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [postType, setPostType] = useState<PostType>('regular');
    const [content, setContent] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const { dbUser, user } = useAuth();

    const displayImage = dbUser?.profileImageUrl || user?.picture || null;
    const displayName = dbUser?.fullName || user?.name || 'User';
    const initial = displayName.charAt(0).toUpperCase();

    const activeType = POST_TYPES.find(t => t.type === postType)!;

    const handleOpen = (type: PostType = 'regular') => {
        setPostType(type);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setContent('');
        setMediaUrls([]);
        setError('');
        setPostType('regular');
        setShowTypeMenu(false);
    };

    const handleSubmit = async () => {
        if (!content.trim() && !mediaUrls.length) return;
        setSubmitting(true);
        setError('');
        try {
            await createPost({
                content: content.trim(),
                media_urls: mediaUrls,
                post_type: postType,
            });
            handleClose();
            onPostCreated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Post failed');
        } finally {
            setSubmitting(false);
        }
    };

    const quickActions = [
        {
            icon: Video,
            label: 'Video',
            color: 'text-emerald-600',
            bg: 'hover:bg-emerald-50',
            onClick: () => handleOpen('regular'),
            isUpload: true,
        },
        {
            icon: ImageIcon,
            label: 'Photo',
            color: 'text-blue-500',
            bg: 'hover:bg-blue-50',
            onClick: () => handleOpen('regular'),
            isUpload: true,
        },
        {
            icon: FolderKanban,
            label: 'Project Update',
            color: 'text-emerald-700',
            bg: 'hover:bg-emerald-50',
            onClick: () => handleOpen('project_update'),
            isUpload: false,
        },
        {
            icon: HandHelping,
            label: 'Resource Need',
            color: 'text-orange-500',
            bg: 'hover:bg-orange-50',
            onClick: () => handleOpen('resource_need'),
            isUpload: false,
        },
    ];

    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${open
                ? `${activeType.border} ring-4 ring-opacity-10 shadow-lg`
                : 'border-slate-200'
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
                            <div className="h-full w-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-sm">
                                {initial}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        readOnly
                        placeholder="Share an update, story, or opportunity..."
                        onClick={() => handleOpen('regular')}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-400 font-medium hover:border-[#0A66C2] hover:bg-slate-50 transition-all text-sm focus:outline-none cursor-pointer"
                    />
                </div>

                {open && (
                    <div className="mt-3 space-y-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowTypeMenu(p => !p)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${activeType.bg} ${activeType.color} ${activeType.border}`}
                            >
                                {postType === 'regular' && <ImageIcon size={13} />}
                                {postType === 'project_update' && <FolderKanban size={13} />}
                                {postType === 'resource_need' && <HandHelping size={13} />}
                                {activeType.label}
                                <ChevronDown size={12} />
                            </button>

                            {showTypeMenu && (
                                <div className="absolute top-9 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-52">
                                    {POST_TYPES.map(t => (
                                        <button
                                            key={t.type}
                                            onClick={() => {
                                                setPostType(t.type);
                                                setShowTypeMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all ${postType === t.type
                                                    ? `${t.bg} ${t.color}`
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {t.label}
                                            {t.type === 'project_update' && (
                                                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                                    Link a post to a project
                                                </span>
                                            )}
                                            {t.type === 'resource_need' && (
                                                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                                    Request resources or volunteers
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {postType === 'project_update' && (
                            <div className="flex items-start gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <FolderKanban size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-emerald-700 leading-relaxed">
                                    Project updates are linked to your projects and help surface your work to supporters and volunteers.
                                </p>
                            </div>
                        )}
                        {postType === 'resource_need' && (
                            <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl">
                                <HandHelping size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-orange-700 leading-relaxed">
                                    Resource needs are visible to donors and volunteers who can match your request.
                                </p>
                            </div>
                        )}

                        <textarea
                            autoFocus
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={activeType.placeholder}
                            rows={4}
                            className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all ${activeType.border} focus:ring-current`}
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
                                            onClick={() => setMediaUrls(p => p.filter((_, j) => j !== i))}
                                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 z-10"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && <p className="text-xs text-red-500">{error}</p>}
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
                                        setMediaUrls(p => [
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
                                        <ImageIcon size={15} /> Add Photo / Video
                                    </button>
                                )}
                            </CldUploadWidget>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || (!content.trim() && !mediaUrls.length)}
                                    className={`px-4 py-1.5 text-xs font-semibold text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 ${postType === 'resource_need'
                                            ? 'bg-orange-500 hover:bg-orange-600'
                                            : postType === 'project_update'
                                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                                : 'bg-[#0A66C2] hover:bg-[#004182]'
                                        }`}
                                >
                                    {submitting && <Loader2 size={12} className="animate-spin" />}
                                    {postType === 'resource_need' ? 'Post Need'
                                        : postType === 'project_update' ? 'Post Update'
                                            : 'Post'}
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
                        {quickActions.map(({ icon: Icon, label, color, bg, onClick, isUpload }) =>
                            isUpload ? (
                                <CldUploadWidget
                                    key={label}
                                    uploadPreset="nconnect_posts"
                                    onSuccess={(result) => {
                                        if (
                                            result.event === 'success' &&
                                            typeof result.info === 'object' &&
                                            result.info &&
                                            'secure_url' in result.info
                                        ) {
                                            setMediaUrls(p => [
                                                ...p,
                                                (result.info as { secure_url: string }).secure_url,
                                            ]);
                                            setOpen(true);
                                        }
                                    }}
                                >
                                    {({ open: openWidget }) => (
                                        <button
                                            onClick={() => openWidget()}
                                            className={`flex items-center gap-1.5 px-3 py-2 ${bg} rounded-xl transition-all group`}
                                        >
                                            <Icon size={18} className={`${color} transition-transform group-hover:scale-110`} />
                                            <span className="text-[12px] font-semibold text-slate-500 group-hover:text-slate-800 hidden sm:inline">
                                                {label}
                                            </span>
                                        </button>
                                    )}
                                </CldUploadWidget>
                            ) : (
                                <button
                                    key={label}
                                    onClick={onClick}
                                    className={`flex items-center gap-1.5 px-3 py-2 ${bg} rounded-xl transition-all group`}
                                >
                                    <Icon size={18} className={`${color} transition-transform group-hover:scale-110`} />
                                    <span className="text-[12px] font-semibold text-slate-500 group-hover:text-slate-800 hidden sm:inline">
                                        {label}
                                    </span>
                                </button>
                            )
                        )}
                    </div>
                </>
            )}
        </div>
    );
}