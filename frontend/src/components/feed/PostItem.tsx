"use client";
import React, { useState } from 'react';
import { MoreHorizontal, X, ThumbsUp, MessageSquare, Repeat2, Send, Heart } from "lucide-react";

const reactions = [
    { Icon: ThumbsUp, label: "Like", color: "hover:text-[#0A66C2]", activeColor: "text-[#0A66C2]" },
    { Icon: MessageSquare, label: "Comment", color: "hover:text-emerald-600", activeColor: "text-emerald-600" },
    { Icon: Repeat2, label: "Repost", color: "hover:text-orange-500", activeColor: "text-orange-500" },
    { Icon: Send, label: "Send", color: "hover:text-blue-500", activeColor: "text-blue-500" },
];

export default function PostItem() {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(24);

    const handleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => liked ? prev - 1 : prev + 1);
    };

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md group">
            <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="h-11 w-11 bg-linear-to-br from-slate-600 to-slate-800 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm">
                        S
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 hover:text-[#0A66C2] cursor-pointer transition-colors flex items-center gap-1.5">
                            Sureson Maharjan
                            <span className="text-slate-300 font-normal text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md">1st</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">CEH Certified · Senior Auditor</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">1w · Edited · 🌐</p>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                        <MoreHorizontal size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="px-4 pb-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                    A very timely and important initiative for strengthening the digital trust of Nepal&apos;s capital market.{" "}
                    <span className="text-[#0A66C2] cursor-pointer hover:underline font-medium">Read more</span>
                </p>
            </div>

            <div className="mx-4 mb-3 rounded-xl overflow-hidden">
                <div className="bg-linear-to-br from-orange-500 to-rose-600 h-44 flex items-end p-5">
                    <div>
                        <p className="text-orange-200 text-[11px] font-semibold uppercase tracking-widest mb-1">Featured</p>
                        <h3 className="text-white font-black text-xl leading-tight">Audit of Stockbrokers</h3>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                    <span className="h-4 w-4 bg-[#0A66C2] rounded-full flex items-center justify-center">
                        <Heart size={9} className="text-[#0A66C2] fill-[#0A66C2]" />
                    </span>
                    <span>{likeCount} reactions</span>
                </div>
                <span className="cursor-pointer hover:underline hover:text-slate-700 transition-colors">8 comments</span>
            </div>

            <div className="border-t border-slate-100 mx-0 px-2 py-1 flex">
                {reactions.map(({ Icon, label, color, activeColor }) => {
                    const isActive = label === "Like" && liked;
                    return (
                        <button
                            key={label}
                            onClick={label === "Like" ? handleLike : undefined}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl transition-all text-[12px] font-semibold
                                ${isActive ? activeColor : `text-slate-500 ${color}`}
                                hover:bg-slate-50`}
                        >
                            <Icon size={16} className={isActive ? "fill-current" : ""} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    );
                })}
            </div>
        </article>
    );
}