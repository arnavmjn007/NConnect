"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
    Search, Send, Phone, Video, Info,
    Smile, Paperclip, ImageIcon, MoreHorizontal,
    Star, Edit2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const conversations = [
    {
        id: 1, name: "Water for All", initials: "W",
        color: "from-blue-600 to-blue-800",
        lastMsg: "Thanks for your donation!", time: "2m", unread: 2, online: true,
    },
    {
        id: 2, name: "Education Alliance", initials: "E",
        color: "from-violet-600 to-violet-800",
        lastMsg: "We'd love to have you volunteer", time: "1h", unread: 0, online: false,
    },
    {
        id: 3, name: "Arnav Maharjan", initials: "A",
        color: "from-slate-600 to-slate-800",
        lastMsg: "Sure, let's connect next week", time: "3h", unread: 0, online: true,
    },
    {
        id: 4, name: "Food Relief Network", initials: "F",
        color: "from-orange-600 to-orange-800",
        lastMsg: "Resource request approved!", time: "1d", unread: 1, online: false,
    },
    {
        id: 5, name: "Green Earth Foundation", initials: "G",
        color: "from-emerald-600 to-emerald-800",
        lastMsg: "Join our reforestation drive", time: "2d", unread: 0, online: false,
    },
    {
        id: 6, name: "Hope for Children", initials: "H",
        color: "from-rose-600 to-rose-800",
        lastMsg: "Thank you for volunteering!", time: "3d", unread: 0, online: false,
    },
];

const messagesByConv: Record<number, { id: number; from: string; text: string; time: string }[]> = {
    1: [
        { id: 1, from: "other", text: "Hi! Thank you so much for donating to our Clean Water Initiative.", time: "10:32 AM" },
        { id: 2, from: "me", text: "Of course! It's such an important cause. How is the project progressing?", time: "10:35 AM" },
        { id: 3, from: "other", text: "We've reached 90% of our goal! We're hoping to break ground on the first well next month.", time: "10:36 AM" },
        { id: 4, from: "other", text: "We'd also love to have you as a volunteer if you're available.", time: "10:36 AM" },
        { id: 5, from: "me", text: "That's amazing! I'd definitely be interested. What does that involve?", time: "10:40 AM" },
        { id: 6, from: "other", text: "Mostly logistics and coordination. We're organising a team for June.", time: "10:42 AM" },
    ],
    2: [
        { id: 1, from: "other", text: "Hello! We noticed your profile and think you'd be a great fit for our upcoming school drive.", time: "9:00 AM" },
        { id: 2, from: "me", text: "That sounds interesting! Tell me more.", time: "9:15 AM" },
        { id: 3, from: "other", text: "We'd love to have you volunteer this May in Kathmandu.", time: "9:20 AM" },
    ],
    3: [
        { id: 1, from: "me", text: "Hey Arnav! Are you free for a call this week?", time: "Yesterday" },
        { id: 2, from: "other", text: "Sure, let's connect next week!", time: "Yesterday" },
    ],
    4: [
        { id: 1, from: "other", text: "Your resource request for the Cargo Van has been approved!", time: "Apr 22" },
        { id: 2, from: "me", text: "Wonderful, thank you so much!", time: "Apr 22" },
    ],
    5: [
        { id: 1, from: "other", text: "Join our Amazon reforestation drive this April!", time: "Apr 20" },
    ],
    6: [
        { id: 1, from: "other", text: "Thank you for signing up to volunteer with us!", time: "Apr 18" },
    ],
};


function ConvItem({
    conv, active, onClick,
}: {
    conv: typeof conversations[0];
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left border-b border-slate-50
        ${active
                    ? "bg-indigo-50/60 border-l-[3px] border-l-indigo-600"
                    : "hover:bg-slate-50 border-l-[3px] border-l-transparent"}`}
        >
            <div className="relative shrink-0">
                <div className={`h-11 w-11 bg-linear-to-br ${conv.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                    {conv.initials}
                </div>
                {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <span className={`text-sm truncate ${conv.unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                        {conv.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{conv.time}</span>
                </div>
                <p className={`text-[12px] truncate mt-0.5 ${conv.unread > 0 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                    {conv.lastMsg}
                </p>
            </div>
            {conv.unread > 0 && (
                <span className="h-5 w-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread}
                </span>
            )}
        </button>
    );
}
export default function MessagesPage() {
    const [activeConv, setActiveConv] = useState(conversations[0]);
    const [allMessages, setAllMessages] = useState(messagesByConv);
    const [input, setInput] = useState("");
    const [convSearch, setConvSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("Focused");
    const bottomRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const messages = allMessages[activeConv.id] ?? [];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeConv]);
    const send = () => {
        if (!input.trim()) return;
        setAllMessages(prev => ({
            ...prev,
            [activeConv.id]: [
                ...(prev[activeConv.id] ?? []),
                { id: Date.now(), from: "me", text: input.trim(), time: "Now" },
            ],
        }));
        setInput("");
    };
    const filteredConvs = conversations.filter(c =>
        c.name.toLowerCase().includes(convSearch.toLowerCase())
    );
    const filters = ["Focused", "Unread", "Starred"];
    const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy & Terms', href: '/privacy' },
];
    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-7xl mx-auto px-2 md:px-6 py-6">
                <div className="flex gap-5 items-start">
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-8rem)]">
                        <div className="w-72 border-r border-slate-100 flex flex-col shrink-0">
                            <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
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
                                        className="w-full pl-8 pr-4 py-2 text-xs bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                                    {filters.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setActiveFilter(f)}
                                            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${activeFilter === f
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                {filteredConvs.map(conv => (
                                    <ConvItem
                                        key={conv.id}
                                        conv={conv}
                                        active={activeConv.id === conv.id}
                                        onClick={() => setActiveConv(conv)}
                                    />
                                ))}
                                {filteredConvs.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 py-8">No conversations found</p>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`h-10 w-10 bg-linear-to-br ${activeConv.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                            {activeConv.initials}
                                        </div>
                                        {activeConv.online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm leading-tight">{activeConv.name}</p>
                                        <p className={`text-[11px] font-semibold ${activeConv.online ? "text-emerald-500" : "text-slate-400"}`}>
                                            {activeConv.online ? "Active now" : "Offline"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {([Phone, Video, Star, Info] as React.ElementType[]).map((Icon, i) => (
                                        <button key={i} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                                            <Icon size={17} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide bg-slate-50/30">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${msg.from === "me" ? "items-end" : "items-start"}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "me"
                                                ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                                                : "bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm"
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                            <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                    {([ImageIcon, Paperclip, Smile] as React.ElementType[]).map((Icon, i) => (
                                        <button key={i} className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                                            <Icon size={17} />
                                        </button>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Write a message..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && send()}
                                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none mx-1"
                                    />
                                    <button
                                        onClick={send}
                                        disabled={!input.trim()}
                                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <aside className="lg:flex flex-col w-50 sticky top-20 self-start pt-2 shrink-0">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                            {footerLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                            <Image src="/logo.png" alt="NConnect" width={60} height={60} />
                            <p className="text-[11px] text-slate-400 font-medium">NConnect Corp © 2026</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}