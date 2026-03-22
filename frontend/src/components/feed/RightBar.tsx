import React from 'react';
import { Droplets, Utensils, GraduationCap, Info } from 'lucide-react';

const ProgressBar = ({ raised, goal }: { raised: number, goal: number }) => {
    const percentage = Math.min((raised / goal) * 100, 100);
    return (
        <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export default function RightBar() {
    return (
        <aside className="space-y-4 sticky top-20">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-lg text-slate-900">Suggested NGOs</h2>
                    <Info size={16} className="text-gray-400 cursor-pointer" />
                </div>
                <div className="space-y-6">
                    {[
                        { name: "Water for All", followers: "12.5K", Icon: Droplets, color: "text-blue-500" },
                        { name: "Food Relief Network", followers: "8.2K", Icon: Utensils, color: "text-orange-500" },
                        { name: "Education Alliance", followers: "15.3K", Icon: GraduationCap, color: "text-gray-600" },
                    ].map((ngo) => (
                        <div key={ngo.name} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <ngo.Icon className={ngo.color} size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 leading-tight hover:underline cursor-pointer">
                                        {ngo.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">{ngo.followers} followers</p>
                                </div>
                            </div>
                            <button className="px-4 py-1 border border-blue-600 text-blue-600 text-sm font-semibold rounded-full hover:bg-blue-50 hover:border-blue-700 transition-colors">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h2 className="font-bold text-lg text-slate-900 mb-6">Trending Projects</h2>
                <div className="space-y-8">
                    {[
                        { title: "Clean Water Initiative", raised: 45000, goal: 50000 },
                        { title: "School Supplies Drive", raised: 12000, goal: 20000 },
                        { title: "Emergency Relief Fund", raised: 78000, goal: 100000 },
                    ].map((project) => (
                        <div key={project.title} className="group cursor-pointer">
                            <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </h3>
                            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
                                <span>${project.raised.toLocaleString()} raised</span>
                                <span>${project.goal.toLocaleString()}</span>
                            </div>
                            <ProgressBar raised={project.raised} goal={project.goal} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {['About', 'Accessibility', 'Help Center', 'Privacy & Terms'].map(link => (
                    <span key={link} className="text-[11px] text-gray-500 hover:text-blue-600 hover:underline cursor-pointer">
                        {link}
                    </span>
                ))}
                <p className="text-[11px] text-gray-500 mt-2 w-full text-center font-medium">
                    NConnect Corporation © 2026
                </p>
            </div>
        </aside>
    );
}