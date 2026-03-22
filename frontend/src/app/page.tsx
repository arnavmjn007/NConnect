import React from 'react';
import Sidebar from "@/components/feed/Sidebar";
import PostItem from "@/components/feed/PostItem";
import RightBar from "@/components/feed/RightBar";
import Postbox from "@/components/feed/Postbox"; // Fixed casing


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-6 px-2 md:px-6 items-start max-w-7xl mx-auto">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar />
        </aside>

        <main className="col-span-1 md:col-span-6 space-y-4">
          <Postbox />

          {/* <div className="flex items-center gap-2 px-1">
          <hr className="flex-1 border-gray-300" />
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-[12px] text-gray-500">Sort by:</span>
            <span className="text-[12px] font-bold text-black flex items-center">
              Top <ChevronDown size={14} className="ml-1" />
            </span>
          </div>
        </div> */}

          <div className="space-y-4">
            <PostItem />
            <PostItem />
            <PostItem />
            <PostItem />
            <PostItem />
          </div>
        </main>

        <aside className="hidden lg:block lg:col-span-3">
          <RightBar />
        </aside>
      </div>
    </div>
  );
}