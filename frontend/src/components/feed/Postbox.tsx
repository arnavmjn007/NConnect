"use client";
import React, { useState } from 'react';
import { Youtube, Image as ImageIcon, Newspaper, Smile } from "lucide-react";

const actions = [
    { Icon: Youtube, label: "Video", color: "text-emerald-600", hoverBg: "hover:bg-emerald-50" },
    { Icon: ImageIcon, label: "Photo", color: "text-blue-500", hoverBg: "hover:bg-blue-50" },
    { Icon: Newspaper, label: "Article", color: "text-orange-600", hoverBg: "hover:bg-orange-50" },
    { Icon: Smile, label: "Feeling", color: "text-amber-500", hoverBg: "hover:bg-amber-50" },
];

export default function Postbox() {
    const [focused, setFocused] = useState(false);
    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${focused ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg" : "border-slate-200 shadow-sm"}`}>
            <div className="p-4">
                <div className="flex gap-3 items-center">
                    <div className="h-11 w-11 bg-linear-to-br from-[#0A66C2] to-[#004182] rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <button
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="flex-1 text-left px-4 py-2.5 border border-slate-200 rounded-xl text-slate-400 font-medium hover:border-[#0A66C2] hover:bg-slate-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]"
                    >
                        Share an update, story, or opportunity...
                    </button>
                </div>
            </div>
            <div className="border-t border-slate-100 mx-4" />
            <div className="px-3 py-2 flex items-center justify-between">
                {actions.map(({ Icon, label, color, hoverBg }) => (
                    <button
                        key={label}
                        className={`flex items-center gap-1.5 px-3 py-2 ${hoverBg} rounded-xl transition-all group`}
                    >
                        <Icon size={18} className={`${color} transition-transform group-hover:scale-110`} />
                        <span className="text-[12px] font-semibold text-slate-500 group-hover:text-slate-800 transition-colors hidden sm:inline">
                            {label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}