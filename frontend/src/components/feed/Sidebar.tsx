import React from 'react';
import {
    MapPin,
    Mail,
    Calendar,
    BarChart2,
    Users2,
    ExternalLink
} from "lucide-react";

export default function Sidebar() {

    const user = {
        name: "Arnav Maharjan",
        role: "volunteer",
        location: "Kathmandu, Bagmati",
        email: "arnav@nconnect.org",
        joinedDate: "January 2025",
        stats: {
            following: 4,
            applications: 3,
            donations: 3
        }
    };

    const isNGO = user.role === "ngo";

    return (
        <div className="flex flex-col gap-2 sticky top-20 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="h-16 bg-linear-to-r from-blue-600 to-blue-400" />

                <div className="px-4 pb-4">
                    <div className="relative -mt-10 mb-3 flex justify-center md:justify-start">
                        <div className="h-20 w-20 bg-white p-1 rounded-full border border-gray-100 shadow-md">
                            <div className="h-full w-full bg-slate-200 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <h2 className="font-bold text-lg text-slate-900 leading-tight flex items-center gap-1 cursor-pointer hover:underline">
                            {user.name}
                            {isNGO && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded uppercase">NGO</span>}
                        </h2>

                        <div className="space-y-1 text-gray-500">
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin size={14} /> <span>{user.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Mail size={14} /> <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Calendar size={14} /> <span>Joined {user.joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                        <div className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                            <p className="text-blue-600 font-bold text-lg leading-none">{user.stats.following}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">Following</p>
                        </div>
                        <div className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors border-x border-gray-100">
                            <p className="text-green-600 font-bold text-lg leading-none">{user.stats.applications}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase">Apps</p>
                        </div>
                        <div className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                            <p className="text-purple-600 font-bold text-lg leading-none">{user.stats.donations}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">Donations</p>
                        </div>
                    </div>
                </div>
            </div>

            {isNGO && (
                <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm space-y-1">
                    <button className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <BarChart2 size={18} className="text-slate-600" />
                            <span className="text-sm font-bold text-slate-700">Analytics</span>
                        </div>
                        <ExternalLink size={14} className="text-gray-300 group-hover:text-slate-500" />
                    </button>

                    <button className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <Users2 size={18} className="text-slate-600" />
                            <span className="text-sm font-bold text-slate-700">Volunteers</span>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            12 new
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}