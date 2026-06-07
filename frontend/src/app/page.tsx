"use client";
import React from 'react';
import Sidebar from "@/components/feed/Sidebar";
import PostItem from "@/components/feed/PostItem";
import RightBar from "@/components/feed/RightBar";
import Postbox from "@/components/feed/Postbox";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const MOCK_POST_COUNT = 12;

export default function Home() {
  const { isAuthenticated, dbUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[#EEF3F8] min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-sm w-full text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to NConnect</h2>
          <p className="text-slate-500 text-sm mb-6">Connect with NGOs, volunteers, and social impact professionals.</p>
          <Link
            href="/auth/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (!dbUser?.onboardingComplete) {
    return (
      <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

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
              {Array.from({ length: MOCK_POST_COUNT }).map((_, index) => (
                <PostItem key={index} />
              ))}
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