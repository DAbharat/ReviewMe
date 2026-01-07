// everyone
"use client"
import React, { useEffect, useState } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import PostCard, { Post } from "@/components/post/PostCard"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"


export default function page() {
  const { setOpen } = useSidebar()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [setOpen])

  useEffect(() => {
    let mounted = true
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/posts')
        if (!mounted) return
        if (res.status === 200) {
          setPosts(Array.isArray(res.data.data) ? res.data.data : [])
        } else {
          setPosts([])
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching posts:", axiosError)
        setPosts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPosts()
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen py-6">
      <div className="mx-auto w-full ml-10 max-w-375 px-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        <section className="w-full">
          <h2 className="sr-only">Feed</h2>

          {loading ? (
            <div className="py-24 text-center text-slate-400">Loading feed…</div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
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
