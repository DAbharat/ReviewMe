//everyone
"use client"
import React, { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import PostCard from "@/components/post/PostCard"
import posts from "@/posts.json"


export default function page() {
  const { setOpen } = useSidebar()

  useEffect(() => {
    setOpen(true)
  }, [setOpen])


  return (
    <main className="min-h-screen py-6">
      <div className="mx-auto w-full ml-10 max-w-[1500px] px-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        <section className="w-full">
          <h2 className="sr-only">Feed</h2>
          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostCard key={index} post={post} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
