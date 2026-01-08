// "use client"
// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
// import PostCard, { Post } from '@/components/post/PostCard'
// import CommentPage from '@/components/comments/CommentPage'

// export default function Page({ params }: { params: { postId: string } }) {
//   const { postId } = params
//   const [post, setPost] = useState<Post | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     let mounted = true

//     const fetchPost = async () => {
//       try {
//         const res = await axios.get(`/api/posts/${postId}`)
//         if (!mounted) return
//         setPost(res.data.data)
//       } catch (err) {
//         console.error('Error fetching post', err)
//         setPost(null)
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     }

//     fetchPost()
//     return () => {
//       mounted = false
//     }
//   }, [postId])

//   return (
//     <main className="min-h-screen py-6">
//       <div className="mx-auto w-full ml-10 max-w-375 px-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
//         <section className="w-full">
//           {loading ? (
//             <div className="py-24 text-center text-slate-400">Loading post…</div>
//           ) : post ? (
//             <div className="space-y-6">
//               <PostCard post={post} />

//               <div className="mt-4">
//                 <CommentPage postId={postId} />
//               </div>
//             </div>
//           ) : (
//             <div className="py-24 text-center text-slate-400">Post not found.</div>
//           )}
//         </section>
//       </div>
//     </main>
//   )
// }

