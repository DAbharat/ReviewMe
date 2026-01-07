"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import PostCard, { Post } from '@/components/post/PostCard'
import Link from 'next/link'

export default function ProfileClient({ username }: { username: string }) {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    const fetchPosts = async () => {
      try {
        setLoading(true)
        // First try fetching posts for the given username
        const encoded = encodeURIComponent(username)
        let res = await axios.get(`/api/posts/username=${encoded}`)
        if (!mounted) return
        if (res.status === 200 && res.data?.success) {
          const d = res.data.data
          setPosts(Array.isArray(d) ? d : [])
          return
        }

        // Fallback: fetch posts for the current session user
        res = await axios.get('/api/posts/me')
        if (!mounted) return
        if (res.status === 200 && res.data?.success) {
          const d = res.data.data
          setPosts(Array.isArray(d) ? d : [])
        } else {
          setPosts([])
        }
      } catch (err) {
        console.error('Fetch posts error', err)
        setPosts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPosts()
    return () => { mounted = false }
  }, [username])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="bg-slate-900/50 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex-1 w-full">
          <h1 className="text-2xl font-bold">{username}</h1>
          <p className="text-sm text-slate-300 mt-1">Product-minded engineer. Writing about design, performance, and shipping faster.</p>

          <div className="mt-4">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-lg font-semibold">{posts ? posts.length : '—'}</span>
              <span className="text-sm text-slate-400">Posts</span>
            </div>
            <div className="text-sm text-slate-500 mt-2">Member since 2023</div>
          </div>
        </div>
      </header>

      <Separator className="my-6" />

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent posts</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400"><Spinner /> Loading posts…</div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-400">You have not created a post yet.</div>
        )}
      </section>
    </div>
  )
}