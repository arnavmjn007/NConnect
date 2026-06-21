"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import {
    getNotifications,
    getUnreadCount,
    markAllRead,
    markOneRead,
    deleteNotification,
} from '@/lib/feedApi';

export interface Notification {
    id: string;
    recipient_id: string;
    actor_id: string | null;
    type: string;
    title: string;
    message: string;
    entity_type: string | null;
    entity_id: string | null;
    is_read: boolean;
    created_at: string;
    actor_username?: string;
    actor_full_name?: string;
    actor_image?: string;
}

export function useNotifications() {
    const { on } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const [data, countData] = await Promise.all([
                getNotifications(1),
                getUnreadCount(),
            ]);
            setNotifications(data.notifications);
            setUnreadCount(countData.count);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const off = on<Notification>('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });
        return off;
    }, [on]);

    const handleMarkAll = useCallback(async () => {
        await markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }, []);

    const handleMarkOne = useCallback(async (id: string) => {
        await markOneRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await deleteNotification(id);
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.is_read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.filter(n => n.id !== id);
        });
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        handleMarkAll,
        handleMarkOne,
        handleDelete,
        reload: load,
    };
}