import React from 'react';
import Sidebar from "@/components/feed/Sidebar";
import PostItem from "@/components/feed/PostItem";
import RightBar from "@/components/feed/RightBar";
import Postbox from "@/components/feed/Postbox"; // Fixed casing


export default function Home() {
  return (
    <div className="bg-[#EEF3F8] min-h-screen">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-6">
          <aside className="hidden md:block md:col-span-3 sticky top-20 self-start">
            <Sidebar />
          </aside>

          <main className="col-span-1 md:col-span-6 space-y-4 pb-10">
            <Postbox />
            <div className="space-y-4">
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
              <PostItem />
            </div>
          </main>

          <aside className="hidden lg:block lg:col-span-3 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide pb-6">
            <RightBar />
          </aside>
        </div>
      </div>
    </div>
  );
}