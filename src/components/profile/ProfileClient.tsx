"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import PostCard, { Post } from '@/components/post/PostCard'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ProfileClient({ username }: { username: string }) {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

const { data: session } = useSession()
  const user = session?.user 
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const encoded = encodeURIComponent(username)
        let res = await axios.get(`/api/posts?username=${encoded}`)
        if (!mounted) return

        if (res.status === 200 && res.data?.success) {
          setPosts(Array.isArray(res.data.data) ? res.data.data : [])
          return
        }
      } catch {
        setPosts([])
      } finally {
        mounted && setLoading(false)
      }
    }

    fetchPosts()
    return () => { mounted = false }
  }, [username])

  return (
    <div className="min-h-screen pt-16 pb-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <header className="rounded-xl p-6 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold shadow-md shrink-0">
              {username?.charAt(0).toUpperCase() ?? 'U'}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h1 className="text-2xl font-bold">{user?.username ?? user?.name ?? "User"}</h1>

              <p className="text-sm text-slate-300 max-w-md leading-relaxed mx-auto sm:mx-0">
                Product-minded engineer. Writing about design, performance, and shipping faster.
              </p>

              <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-400">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-white">
                    {posts ? posts.length : '—'}
                  </span>
                  <span>Posts</span>
                </div>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span>Member since 2023</span>
              </div>
            </div>
          </div>
        </header>

        <Separator />

        {/* Posts Section */}
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Recent posts</h2>
            {!loading && posts && (
              <p className="text-sm text-slate-400 mt-1">
                {posts.length === 0
                  ? 'No posts yet'
                  : `Showing ${posts.length} post${posts.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
              <Spinner />
              <span className="text-sm">Loading posts…</span>
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.map((p) => (
                  <div
                    key={p._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/comments/${p._id}`)}
                    role="link"
                  >
                    <PostCard post={p} />
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-2">
              <p className="text-slate-400">You have not created a post yet.</p>
              <p className="text-sm text-slate-500">
                Start sharing your thoughts and ideas with the community.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
