import React from 'react';
import { Camera, Image as ImageIcon, Calendar, LayoutIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4">

      <aside className="hidden md:block md:col-span-3">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="h-14 bg-[#a0b4b7]" />

          <div className="px-4 pb-4">

            <div className="relative -mt-8 flex justify-center">
              <div className="h-16 w-16 bg-white p-1 rounded-full border border-gray-100">
                <div className="h-full w-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <LayoutIcon size={30} />
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <h2 className="font-semibold text-base hover:underline cursor-pointer">Your Name</h2>
              <p className="text-xs text-gray-500 mt-1">NGO Coordinator | Community Builder</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-500 hover:bg-gray-100 p-1 cursor-pointer">
                <span>Profile viewers</span>
                <span className="text-blue-600">42</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-500 hover:bg-gray-100 p-1 cursor-pointer">
                <span>Post impressions</span>
                <span className="text-blue-600">1,204</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="col-span-1 md:col-span-6 space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex gap-3 items-center mb-3">
            <div className="h-12 w-12 bg-gray-200 rounded-full" />
            <button className="flex-1 text-left px-4 py-2.5 border border-gray-300 rounded-full text-gray-500 font-medium hover:bg-gray-100 transition-colors text-sm">
              Start a project update...
            </button>
          </div>

          <div className="flex justify-between px-2">
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-blue-500 text-sm font-semibold">
              <ImageIcon size={20} /> Media
            </button>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-orange-400 text-sm font-semibold">
              <Calendar size={20} /> Event
            </button>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-pink-500 text-sm font-semibold">
              <Camera size={20} /> Photo
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">N</div>
            <div>
              <h4 className="text-sm font-bold">NConnect Team</h4>
              <p className="text-[10px] text-gray-500">Official Update • 2h ago</p>
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">
            Welcome to the NConnect platform! We are officially live. Start exploring projects and connecting with local NGOs to make an impact today. 🌍✨
          </p>
          <div className="mt-4 border-t pt-2 flex justify-between text-gray-500 text-sm font-semibold">
            <button className="p-2 hover:bg-gray-100 flex-1 rounded text-center">Like</button>
            <button className="p-2 hover:bg-gray-100 flex-1 rounded text-center">Comment</button>
            <button className="p-2 hover:bg-gray-100 flex-1 rounded text-center">Share</button>
          </div>
        </div>
      </main>


      <aside className="hidden lg:block lg:col-span-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-20">
          <h2 className="font-bold text-sm mb-4">Community News</h2>
          <ul className="space-y-4">
            <li className="cursor-pointer group">
              <p className="text-sm font-bold group-hover:underline">Project: Clean Water Initiative</p>
              <p className="text-xs text-gray-500">2d ago • 1,432 readers</p>
            </li>
            <li className="cursor-pointer group">
              <p className="text-sm font-bold group-hover:underline">NGOs hiring volunteers</p>
              <p className="text-xs text-gray-500">1d ago • 856 readers</p>
            </li>
          </ul>
          <button className="mt-4 w-full py-1 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded border border-gray-300">
            Show more
          </button>
        </div>
      </aside>

    </div>
  );
}