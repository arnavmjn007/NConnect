"use client";
import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search, Send, Info,
    Smile, Paperclip, ImageIcon, MoreHorizontal,
    Star, Edit2, Loader2, MessageSquare,
} from 'lucide-react';
import SiteFooter from '@/components/ui/SiteFooter';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import Image from "next/image";
import { getConversations, getMessages, startConversation } from '@/lib/feedApi';

interface Conversation {
    id: string;
    other_user_id: string;
    other_user_name?: string;
    other_user_image?: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

const filters = ['All', 'Unread'] as const;
const headerActions = [Star, Info] as React.ElementType[];
const inputActions = [ImageIcon, Paperclip, Smile] as React.ElementType[];

function timeLabel(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const diffH = (Date.now() - d.getTime()) / 3600000;
    if (diffH < 1) return `${Math.round(diffH * 60)}m`;
    if (diffH < 24) return `${Math.round(diffH)}h`;
    return d.toLocaleDateString();
}

function getInitial(userId: string, name?: string) {
    if (name) return name.charAt(0).toUpperCase();
    return userId.charAt(0).toUpperCase();
}

function getDisplayName(conv: Conversation) {
    return conv.other_user_name || conv.other_user_id;
}

async function enrichConversations(convs: Conversation[]): Promise<Conversation[]> {
    const enriched = await Promise.all(convs.map(async (conv) => {
        try {
            const res = await fetch(`/api/users?auth0Id=${encodeURIComponent(conv.other_user_id)}`);
            if (res.ok) {
                const users = await res.json();
                const u = Array.isArray(users) ? users[0] : users;
                if (u) {
                    return {
                        ...conv,
                        other_user_name: u.organizationName || u.fullName || u.username || conv.other_user_id,
                        other_user_image: u.profileImageUrl || null,
                    };
                }
            }
        } catch { /* silent */ }
        return conv;
    }));
    return enriched;
}

function MessagesContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { joinConversations, sendMessage, sendTyping, markRead, on } = useSocket();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [convSearch, setConvSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('All');
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [startingChat, setStartingChat] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const raw = await getConversations();
                const enriched = await enrichConversations(raw);
                if (!cancelled) {
                    setConversations(enriched);
                    joinConversations(enriched.map((c: Conversation) => c.id));

                    const withUserId = searchParams.get('with');
                    if (withUserId) {
                        const existing = enriched.find((c: Conversation) => c.other_user_id === withUserId);
                        if (existing) {
                            setActiveConv(existing);
                        } else {
                            setStartingChat(true);
                            try {
                                const newConv = await startConversation(withUserId);
                                const newConvFull: Conversation = {
                                    id: newConv.id,
                                    other_user_id: withUserId,
                                    last_message: null,
                                    last_message_at: null,
                                    unread_count: 0,
                                };
                                const enrichedNew = await enrichConversations([newConvFull]);
                                if (!cancelled) {
                                    setConversations(prev => [enrichedNew[0], ...prev]);
                                    setActiveConv(enrichedNew[0]);
                                    joinConversations([newConv.id]);
                                }
                            } catch { /* silent */ }
                            finally { if (!cancelled) setStartingChat(false); }
                        }
                        router.replace('/messages');
                    } else if (enriched.length) {
                        setActiveConv(enriched[0]);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoadingConvs(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [joinConversations, searchParams, router]);

    useEffect(() => {
        if (!activeConv?.id) return;
        let cancelled = false;
        setLoadingMsgs(true);
        async function load() {
            try {
                const data = await getMessages(activeConv!.id);
                if (!cancelled) setMessages(data);
            } catch {
                if (!cancelled) setMessages([]);
            } finally {
                if (!cancelled) setLoadingMsgs(false);
            }
        }
        load();
        markRead(activeConv.id);
        setConversations(prev => prev.map(c =>
            c.id === activeConv.id ? { ...c, unread_count: 0 } : c
        ));
        return () => { cancelled = true; };
    }, [activeConv, on, markRead]);

    // Socket events
    useEffect(() => {
        const offMsg = on<Message>('receive_message', (msg) => {
            if (msg.conversation_id === activeConv?.id) {
                setMessages(prev => [...prev, msg]);
                markRead(msg.conversation_id);
            } else {
                setConversations(prev => prev.map(c =>
                    c.id === msg.conversation_id
                        ? { ...c, last_message: msg.content, last_message_at: msg.created_at, unread_count: c.unread_count + 1 }
                        : c
                ));
            }
        });

        const offTyping = on<{ userId: string; isTyping: boolean }>('typing', ({ userId, isTyping }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                if (isTyping) next.add(userId); else next.delete(userId);
                return next;
            });
        });

        const offOnline = on<{ userId: string }>('user_online', ({ userId }) => {
            setOnlineUsers(prev => new Set(prev).add(userId));
        });

        const offOffline = on<{ userId: string }>('user_offline', ({ userId }) => {
            setOnlineUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
        });

        return () => { offMsg?.(); offTyping?.(); offOnline?.(); offOffline?.(); };
    }, [activeConv?.id, on, markRead]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(() => {
        if (!input.trim() || !activeConv) return;
        sendMessage(activeConv.id, input.trim());
        setMessages(prev => [...prev, {
            id: `temp-${Date.now()}`,
            conversation_id: activeConv.id,
            sender_id: user?.sub ?? '',
            content: input.trim(),
            created_at: new Date().toISOString(),
        }]);
        setConversations(prev => prev.map(c =>
            c.id === activeConv.id
                ? { ...c, last_message: input.trim(), last_message_at: new Date().toISOString() }
                : c
        ));
        setInput('');
        sendTyping(activeConv.id, false);
    }, [input, activeConv, sendMessage, sendTyping, user?.sub]);

    const handleInputChange = (val: string) => {
        setInput(val);
        if (!activeConv) return;
        sendTyping(activeConv.id, true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => sendTyping(activeConv.id, false), 1500);
    };

    const filteredConvs = conversations.filter(c => {
        const nameMatch = getDisplayName(c).toLowerCase().includes(convSearch.toLowerCase());
        if (activeFilter === 'Unread') return nameMatch && c.unread_count > 0;
        return nameMatch;
    });

    const isOtherOnline = activeConv ? onlineUsers.has(activeConv.other_user_id) : false;
    const isOtherTyping = activeConv ? typingUsers.has(activeConv.other_user_id) : false;

    if (startingChat) {
        return (
            <div className="bg-[#F4F2EE] h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={28} />
                    <p className="text-slate-500 text-sm font-medium">Starting conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F4F2EE] h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col">
            <div className="max-w-7xl w-full mx-auto px-4 flex flex-col h-full pt-4">
                <div className="flex gap-4 min-h-0 flex-1 items-stretch">

                    <div className="flex-1 bg-white rounded-t-xl border-t border-x border-stone-200 shadow-sm flex min-h-0 overflow-hidden">
                        <div className="w-72 xl:w-80 border-r border-stone-200 flex flex-col shrink-0 bg-white">
                            <div className="px-4 pt-3 pb-3 border-b border-stone-200 shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-slate-900 text-base">Messaging</h2>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                                            <Edit2 size={15} />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                                            <MoreHorizontal size={15} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        value={convSearch}
                                        onChange={e => setConvSearch(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 text-xs bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="flex gap-1.5">
                                    {filters.map(f => (
                                        <button key={f} onClick={() => setActiveFilter(f)}
                                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${activeFilter === f
                                                ? 'bg-emerald-700 text-white border-emerald-700'
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                                                }`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loadingConvs ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="animate-spin text-slate-300" size={20} />
                                    </div>
                                ) : filteredConvs.length === 0 ? (
                                    <div className="text-center py-10 px-4">
                                        <MessageSquare size={28} className="mx-auto mb-2 text-slate-300" />
                                        <p className="text-xs text-slate-400 font-medium">No conversations yet</p>
                                        <p className="text-[11px] text-slate-300 mt-1">Start chatting from a profile page or after a volunteer is accepted</p>
                                    </div>
                                ) : (
                                    filteredConvs.map(conv => {
                                        const displayName = getDisplayName(conv);
                                        const initial = getInitial(conv.other_user_id, conv.other_user_name);
                                        return (
                                            <button key={conv.id} onClick={() => setActiveConv(conv)}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left border-b border-slate-100 ${activeConv?.id === conv.id
                                                    ? 'bg-slate-100/80 border-l-[3px] border-l-stone-700'
                                                    : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                                                    }`}>
                                                <div className="relative shrink-0">
                                                    {conv.other_user_image ? (
                                                        <Image
                                                            src={conv.other_user_image}
                                                            alt={displayName}
                                                            width={44}
                                                            height={44}
                                                            className="h-11 w-11 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-11 w-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                            {initial}
                                                        </div>
                                                    )}
                                                    {onlineUsers.has(conv.other_user_id) && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                            {displayName}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                                                            {timeLabel(conv.last_message_at)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-[12px] truncate mt-0.5 ${conv.unread_count > 0 ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                                                        {conv.last_message ?? 'No messages yet'}
                                                    </p>
                                                </div>
                                                {conv.unread_count > 0 && (
                                                    <span className="h-5 w-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat area */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white">
                            {activeConv ? (
                                <>
                                    <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                {activeConv.other_user_image ? (
                                                    <Image
                                                        src={activeConv.other_user_image}
                                                        alt={getDisplayName(activeConv)}
                                                        width={40}
                                                        height={40}
                                                        className="h-10 w-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                        {getInitial(activeConv.other_user_id, activeConv.other_user_name)}
                                                    </div>
                                                )}
                                                {isOtherOnline && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm leading-tight">
                                                    {getDisplayName(activeConv)}
                                                </p>
                                                <p className={`text-[11px] font-semibold ${isOtherOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {isOtherTyping
                                                        ? <span className="text-indigo-500">typing...</span>
                                                        : isOtherOnline ? 'Active now' : 'Offline'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {headerActions.map((Icon, i) => (
                                                <button key={i} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                                                    <Icon size={17} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                                        {loadingMsgs ? (
                                            <div className="flex justify-center pt-8">
                                                <Loader2 className="animate-spin text-slate-300" size={20} />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                                <MessageSquare size={32} className="text-slate-200 mb-3" />
                                                <p className="text-slate-400 text-sm font-medium">No messages yet</p>
                                                <p className="text-slate-300 text-xs mt-1">Send a message to start the conversation</p>
                                            </div>
                                        ) : (
                                            messages.map(msg => {
                                                const isMe = msg.sender_id === user?.sub;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                                                ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm'
                                                                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'
                                                                }`}>
                                                                {msg.content}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 px-1">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}

                                        {isOtherTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                                                    <div className="flex gap-1 items-center h-4">
                                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={bottomRef} />
                                    </div>

                                    <div className="px-4 py-3 border-t border-stone-200 bg-white shrink-0">
                                        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus-within:border-stone-400 transition-all">
                                            {inputActions.map((Icon, i) => (
                                                <button key={i} className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                                                    <Icon size={17} />
                                                </button>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder="Write a message..."
                                                value={input}
                                                onChange={e => handleInputChange(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none mx-1"
                                            />
                                            <button onClick={handleSend} disabled={!input.trim()}
                                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-30">
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                    <MessageSquare size={40} className="text-slate-200" />
                                    <p className="text-slate-400 text-sm font-medium">Select a conversation</p>
                                    <p className="text-slate-300 text-xs">or start one from a profile page</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-full overflow-y-auto">
                        <SiteFooter />
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="bg-[#F4F2EE] h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={28} />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}