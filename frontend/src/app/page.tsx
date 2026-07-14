"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from "@/components/feed/Sidebar";
import RightBar from "@/components/feed/RightBar";
import Postbox from "@/components/feed/Postbox";
import PostItem, { Post } from "@/components/feed/PostItem";
import SiteFooter from "@/components/ui/SiteFooter";
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

  const [tab, setTab] = useState<Tab>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const loaderRef = useRef<HTMLDivElement>(null);

  const initialFetchDone = useRef(false);

  const fetchPosts = useCallback(async (
    currentTab: Tab,
    currentPage: number,
    replace = false
  ) => {
    setFetching(true);
    setError('');
    try {
      const fn = currentTab === 'trending' ? getTrendingFeed
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
      <div className="bg-white">
        <section className="bg-[#EEF3F8]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Connect for a Better World with{" "}
                <span className="text-[#0A66C2]">NConnect</span>
              </h1>
              <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-lg">
                A professional platform bringing together NGOs, volunteers, and donors
                across Nepal — to discover causes, give your time, and fund real impact.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/login"
                  className="bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm text-center"
                >
                  Get Started — It&apos;s Free
                </Link>
                <Link
                  href="/auth/login"
                  className="border border-slate-300 text-slate-700 hover:bg-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm text-center"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Free for NGOs & volunteers
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0A66C2]" /> Secure eSewa & card payments
                </span>
              </div>
            </div>

            <div className="order-1 md:order-2 relative w-full h-48 sm:h-64 md:h-96">
              <Image
                src="/landing-illustration.png"
                alt="People collaborating on social impact projects"
                fill
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              One platform, three ways to make an impact
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base max-w-xl mx-auto">
              Whether you&apos;re running a cause, giving your time, or funding change — NConnect brings it together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "For NGOs",
                desc: "Amplify your reach, publish projects, manage volunteers, and get verified with a blue-tick badge.",
                color: "bg-blue-50 text-[#0A66C2]",
                icon: "📢",
              },
              {
                title: "For Volunteers",
                desc: "Find projects that match your skills, apply in one click, and get AI-recommended causes worth your time.",
                color: "bg-emerald-50 text-emerald-600",
                icon: "🤝",
              },
              {
                title: "For Donors",
                desc: "Fund projects directly via eSewa or card, track exactly where your money goes, and follow real progress.",
                color: "bg-violet-50 text-violet-600",
                icon: "💚",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 hover:border-slate-300 transition-colors">
                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-base sm:text-lg mb-3 sm:mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5 text-sm sm:text-base">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#0A66C2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-14 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Ready to make an impact?
            </h2>
            <p className="text-blue-100 mt-2 text-sm md:text-base max-w-xl mx-auto">
              Join NGOs, volunteers, and donors already using NConnect across Nepal.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-6 bg-white text-[#0A66C2] font-semibold px-7 py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Sign In to Continue
            </Link>
          </div>
        </section>

        <div className="py-8 flex justify-center px-4">
          <SiteFooter />
        </div>
      </div>
    );
  }

  if (!dbUser?.onboardingComplete) return <Spinner />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Posts' },
    { key: 'trending', label: 'Trending' },
    { key: 'following', label: 'Following' },
  ];

  return (
    <div className="bg-[#EEF3F8] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 pt-4 sm:pt-6">

          <aside className="hidden md:block md:col-span-3 sticky top-20 self-start">
            <Sidebar />
          </aside>

          <main className="col-span-1 md:col-span-6 space-y-3 sm:space-y-4 pb-10">
            <Postbox onPostCreated={handlePostCreated} />

            <div className="bg-white rounded-xl border border-slate-200 flex overflow-hidden">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === key
                    ? 'text-[#0A66C2] border-b-2 border-[#0A66C2] bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-b-2 border-transparent'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3 sm:space-y-4">
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 text-center">
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
              <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
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