"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PostCard, { Post } from '@/components/post/PostCard'
import CommentPage from '@/components/comments/CommentPage'
import { useParams } from 'next/navigation'
import CommentForm from '@/components/comments/CommentForm'
import useComments from '@/components/comments/useComments'

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
    <main className="min-h-screen py-6 bg-[#EFE9D5]">
      <div className="mx-auto bg-[#EFE9D5] w-full ml-10 max-w-375 px-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        <section className="w-full">
          {loading ? (
            <div className="py-24 text-center text-slate-400">Loading post…</div>
          ) : post ? (
            <div className="space-y-6">
              <PostCard post={post} />

              <CommentForm
                value={content}
                onChange={setContent}
                onSubmit={async () => {
                  await createComment(content)
                  setContent("")
                }}
                isLoading={isLoading}
              />


              <div className="mt-4 ml-1.5"> Comments
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

