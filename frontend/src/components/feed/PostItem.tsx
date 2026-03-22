import { MoreHorizontal, X, ThumbsUp, MessageSquare, Repeat2, Send } from "lucide-react";

export default function PostItem() {
    return (
        <div className="relative">
            {/* <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <button className="bg-[#0A66C2] text-white text-xs font-bold py-1.5 px-4 rounded-full flex items-center gap-1 shadow-lg hover:bg-[#004182]">
                    <span className="rotate-180">↓</span> New posts
                </button>
            </div> */}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 flex justify-between items-start">
                    <div className="flex gap-2">
                        <div className="h-12 w-12 bg-gray-300 rounded-full" />
                        <div>
                            <h4 className="text-sm font-bold hover:underline cursor-pointer flex items-center gap-1">
                                Sureson Maharjan <span className="text-gray-400 font-normal text-[10px]">• 1st</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-tight">CEH Certified | Senior Auditor</p>
                            <p className="text-[11px] text-gray-500">1w • Edited • 🌐</p>
                        </div>
                    </div>
                    <div className="flex gap-2 text-gray-500">
                        <MoreHorizontal size={20} className="cursor-pointer" />
                        <X size={20} className="cursor-pointer" />
                    </div>
                </div>

                <div className="px-4 pb-3">
                    <p className="text-sm text-gray-800 leading-normal">
                        A very timely and important initiative for strengthening the digital trust of Nepal&apos;s capital market... <span className="text-gray-500 cursor-pointer hover:text-blue-600 hover:underline">more</span>
                    </p>
                </div>

                <div className="border-t border-gray-100">
                    <div className="bg-orange-600 h-48 flex items-end p-4 text-white font-bold text-2xl">
                        Audit of Stockbrokers
                    </div>
                </div>

                <div className="px-2 py-1 flex justify-between border-t border-gray-100">
                    {[
                        { icon: ThumbsUp, label: "Like" },
                        { icon: MessageSquare, label: "Comment" },
                        { icon: Repeat2, label: "Repost" },
                        { icon: Send, label: "Send" }
                    ].map((item) => (
                        <button key={item.label} className="flex flex-1 items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors text-gray-500 font-semibold text-sm">
                            <item.icon size={18} />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}