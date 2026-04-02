"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PostCard, { Post } from '@/components/post/PostCard'
import CommentPage from '@/components/comments/CommentPage'
import { useParams } from 'next/navigation'
import CommentForm from '@/components/comments/CommentForm'
import useComments from '@/components/comments/useComments'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function Page() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const routeParams = useParams()
  const rawPostId = routeParams?.postId
  const postId = Array.isArray(rawPostId) ? rawPostId[0] : rawPostId
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    comments,
    createComment,
    updateComment,
    deleteComment,
  } = useComments(postId!)

  const { data: session } = useSession()

  useEffect(() => {
    let mounted = true

    const fetchPost = async () => {
      if (!postId) {
        if (mounted) {
          setPost(null)
          setLoading(false)
        }
        return
      }

      try {
        const res = await axios.get(`/api/posts/${postId}`)
        if (!mounted) return
        setPost(res.data.data)
      } catch (err) {
        console.error('Error fetching post', err)
        setPost(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPost()
    return () => {
      mounted = false
    }
  }, [postId])

  return (
    <main className="min-h-screen py-4 sm:py-6 bg-[#EFE9D5]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="w-full min-w-0">
          {loading ? (
            <div className="py-24 text-center text-slate-400">Loading post…</div>
          ) : post ? (
            <div className="space-y-4 sm:space-y-6">
              <PostCard key={postId} post={post!} />

              <CommentForm
                value={content}
                onChange={setContent}
                onSubmit={async () => {
                  if (!session) {
                    toast.error("You must be signed in to comment.")
                    return
                  }
                  await createComment(content)
                  setContent("")
                }}
                isLoading={isLoading}
              />

              <div className="mt-2 sm:mt-4 ml-0 sm:ml-1.5">
                <p className="text-sm sm:text-base font-medium text-gray-700 mb-2">Comments</p>
                <CommentPage
                  comments={comments}
                  onUpdate={updateComment}
                  onDelete={deleteComment}
                />
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400">Post not found.</div>
          )}
        </section>
      </div>
    </main>
  )
}