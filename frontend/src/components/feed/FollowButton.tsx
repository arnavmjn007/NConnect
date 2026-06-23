"use client";
import React, { useState } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FollowButtonProps {
    targetAuth0Id: string;
    initialFollowing?: boolean;
    onFollowChange?: (following: boolean) => void;
    size?: 'sm' | 'md';
    className?: string;
}

export default function FollowButton({
    targetAuth0Id,
    initialFollowing = false,
    onFollowChange,
    size = 'sm',
    className = '',
}: FollowButtonProps) {
    const { user } = useAuth();
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    if (!user || user.sub === targetAuth0Id) return null;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/follow/${encodeURIComponent(targetAuth0Id)}`, {
                method: following ? 'DELETE' : 'POST',
            });
            if (res.ok) {
                const next = !following;
                setFollowing(next);
                onFollowChange?.(next);
                window.dispatchEvent(new CustomEvent('follow-changed'));
            }
        } catch (err) {
            console.error('Follow error:', err);
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = size === 'sm'
        ? 'text-xs px-4 py-1.5'
        : 'text-sm px-5 py-2';

    if (following) {
        return (
            <button
                onClick={handleClick}
                disabled={loading}
                className={`flex items-center justify-center gap-1.5 font-semibold rounded-full border transition-colors duration-200
                    bg-indigo-600 text-white border-indigo-600 hover:bg-red-600 hover:text-white hover:border-red-600
                    disabled:opacity-50 ${sizeClasses} ${className}`}
            >
                <UserMinus size={size === 'sm' ? 12 : 14} />
                {loading ? '...' : 'Following'}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`flex items-center justify-center gap-1.5 font-semibold rounded-full border transition-colors duration-200
                border-indigo-600 text-indigo-600 hover:bg-indigo-50
                disabled:opacity-50 ${sizeClasses} ${className}`}
        >
            <UserPlus size={size === 'sm' ? 12 : 14} />
            {loading ? '...' : 'Follow'}
        </button>
    );
}