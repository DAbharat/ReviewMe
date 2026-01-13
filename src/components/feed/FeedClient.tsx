"use client"

import React, { useEffect, useState } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import PostCard, { Post } from "@/components/post/PostCard"
import axios from "axios"
import { useSearchParams } from "next/navigation"

export default function FeedClient() {
  const { setOpen } = useSidebar()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""

  useEffect(() => {
    setOpen(true)
  }, [setOpen])

  useEffect(() => {
    let mounted = true

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const url = search
          ? `/api/posts?search=${encodeURIComponent(search)}`
          : "/api/posts"

        const res = await axios.get(url)
        if (!mounted) return
        setPosts(Array.isArray(res.data.data) ? res.data.data : [])
      } catch (err) {
        setPosts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPosts()
    return () => {
      mounted = false
    }
  }, [search])

  return (
    <main className="min-h-screen bg-[#EFE9D5] py-6">
      <div className="mx-auto w-full bg-[#EFE9D5] ml-10 max-w-375 px-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        <section className="w-full">
          {loading ? (
            <div className="py-24 text-center text-slate-400">Loading feed…</div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard post={post} key={post._id} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400">No posts yet.</div>
          )}
        </section>
      </div>
    </main>
  )
}
