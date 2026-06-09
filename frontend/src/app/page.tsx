"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Sidebar  from "@/components/feed/Sidebar";
import RightBar from "@/components/feed/RightBar";
import Postbox  from "@/components/feed/Postbox";
import PostItem, { Post } from "@/components/feed/PostItem";
import { useAuth } from "@/hooks/useAuth";
import { getFeed, getTrendingFeed, getFollowingFeed } from "@/lib/feedApi";
import { Loader2 } from 'lucide-react';

type Tab = 'all' | 'trending' | 'following';


function Spinner() {
  return (
    <div className="bg-[#EEF3F8] min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, dbUser, isLoading, user } = useAuth();

  const [tab, setTab]         = useState<Tab>('all');
  const [posts, setPosts]     = useState<Post[]>([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError]     = useState('');
  const loaderRef             = useRef<HTMLDivElement>(null);

  const initialFetchDone      = useRef(false);

  const fetchPosts = useCallback(async (
    currentTab: Tab,
    currentPage: number,
    replace = false
  ) => {
    setFetching(true);
    setError('');
    try {
      const fn = currentTab === 'trending'  ? getTrendingFeed
               : currentTab === 'following' ? getFollowingFeed
               : getFeed;
      const data = await fn(currentPage);
      setPosts(prev => replace ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !dbUser?.onboardingComplete) return;
    initialFetchDone.current = false;
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(tab, 1, true).then(() => {
      initialFetchDone.current = true;
    });
  }, [tab, isAuthenticated, dbUser?.onboardingComplete, fetchPosts]);

  useEffect(() => {
    if (!isAuthenticated || !dbUser?.onboardingComplete) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !fetching &&
          initialFetchDone.current
        ) {
          const next = page + 1;
          setPage(next);
          fetchPosts(tab, next);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, fetching, page, tab, isAuthenticated, dbUser?.onboardingComplete, fetchPosts]);

  const handlePostCreated = () => {
    initialFetchDone.current = false;
    setPosts([]);
    setPage(1);
    fetchPosts(tab, 1, true).then(() => {
      initialFetchDone.current = true;
    });
  };

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (isLoading) return <Spinner />;


  if (!isAuthenticated) {
    return (
      <div className="bg-[#EEF3F8] min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-sm w-full text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to NConnect</h2>
          <p className="text-slate-500 text-sm mb-6">
            Connect with NGOs, volunteers, and social impact professionals.
          </p>
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

  if (!dbUser?.onboardingComplete) return <Spinner />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',       label: 'All Posts'  },
    { key: 'trending',  label: 'Trending'   },
    { key: 'following', label: 'Following'  },
  ];

  return (
    <div className="bg-[#EEF3F8] min-h-screen">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-6">

          <aside className="hidden md:block md:col-span-3 sticky top-20 self-start">
            <Sidebar />
          </aside>

          <main className="col-span-1 md:col-span-6 space-y-4 pb-10">
            <Postbox onPostCreated={handlePostCreated} />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                    tab === key
                      ? 'text-[#0A66C2] border-b-2 border-[#0A66C2] bg-blue-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  currentUserId={user?.sub as string}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {fetching && (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-slate-400" size={22} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 text-center">
                {error}
                <button
                  onClick={() => fetchPosts(tab, page)}
                  className="ml-2 underline font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {!fetching && !hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-slate-400 py-4">
                You&apos;re all caught up ✓
              </p>
            )}

            {!fetching && posts.length === 0 && !error && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 font-medium">No posts yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  {tab === 'following'
                    ? 'Follow some people to see their posts here.'
                    : 'Be the first to share something!'}
                </p>
              </div>
            )}

            <div ref={loaderRef} className="h-2" />
          </main>

          <aside className="hidden lg:block lg:col-span-3 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide pb-6">
            <RightBar />
          </aside>

        </div>
      </div>
    </div>
  );
}