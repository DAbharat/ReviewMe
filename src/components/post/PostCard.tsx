"use client"
import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, MessageCircle, Flag, Trash, PencilLine, Dot } from 'lucide-react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import CommentForm from '../comments/CommentForm'
import PollOption from './Poll/PollOption'

export type Post = {
  _id: string,
  username?: string;
  createdBy: { _id: string, username?: string; imageUrl?: string };
  title?: string;
  description?: string;
  imageUrl?: string;
  commentCount?: number;
  category?: string
};

export default function PostCard({ post }: { post?: Post }) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const [localCommentCount, setLocalCommentCount] = useState<number>(post?.commentCount ?? 0)

  const isOwner = Boolean(
    session?.user?._id &&
    post?.createdBy &&
    String(session.user._id) === String(post.createdBy)
  )

  const handleDeleteClick = async (postId: string) => {
    if (!session) {
      toast.error("You must be signed in to delete a post.")
      return
    }

    if (!isOwner) {
      toast.error("You must be signed in to delete a post.")
      return
    }

    setDeletePostId(postId)
    setMenuOpen(false)
    setOpen(true)
  }

  const confirmDeletePost = async () => {
    if (!deletePostId) {
      toast.error("Invalid post ID.")
      return
    }

    try {
      setIsLoading(true)
      const result = await axios.delete<ApiResponse>(`/api/posts/${deletePostId}`)
      toast.success("Post deleted successfully.")
      setOpen(false)
      setDeletePostId(null)
      router.refresh()
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "An error occurred while deleting the post.")
    } finally {
      setIsLoading(false)
    }
  }

  const updatePost = async (postId: string) => {
    if (!session) {
      toast.error("You must be signed in to update a post.")
      return
    }

    if (!isOwner) {
      toast.error("You are not authorized to update this post.")
      return
    }

    try {
      setIsLoading(true)
      const result = await axios.put<ApiResponse>(`/api/posts/${postId}`)
      toast.success("Post updated successfully.")
      router.refresh()
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "An error occurred while updating the post.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateComment = async () => {
    if (!session) { toast.error('You must be signed in to comment.'); return; }
    if (!post?._id) {
      toast.error('Invalid post ID.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await axios.post<ApiResponse>(`/api/posts/${post._id}/comments`, { content: commentContent });
      setCommentContent('');
      toast.success('Comment posted.');
      setLocalCommentCount((c) => c + 1)
      router.refresh(); 
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to post comment.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <article className="bg-white mt-4 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <header className="flex items-start gap-3">
        <div className="w-6 h-6 mt-1.5 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm shrink-0">
          {post?.createdBy?.username?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {post?.createdBy?.username || 'Unknown User'}
            </h3>
            
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More Options"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500 shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                {isOwner ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => post?._id && updatePost(post._id)}
                      disabled={isLoading || !post?._id}
                      className="flex items-center gap-2"
                    >
                      <PencilLine className="w-4 h-4" />
                      <span>Update Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => post?._id && handleDeleteClick(post._id)}
                      disabled={isLoading || !post?._id}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                      <span>Delete Post</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="text-red-500">
                    <Flag className="w-4 h-4" /> Report Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {post?.title && (
            <h4 className="mt-2 text-base font-semibold text-gray-900 leading-snug">
              {post.title}
            </h4>
          )}
          
          {post?.description && (
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
              {post.description}
            </p>
          )}
        </div>
      </header>

      {/* Media */}
      {post?.imageUrl && (
        <div className="mt-3">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <img
              src={post.imageUrl}
              alt="post media"
              className="w-full h-48 object-cover block"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Poll Options */}
      {post?._id && (
        <div className="mt-3">
          <PollOption key={post._id} postId={post._id} pollRefreshIntervalMs={15000} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-3 flex items-center justify-between text-sm">
        <Button
          onClick={() => router.push(`/comments/${post?._id}`)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors px-0 h-auto"
          variant="ghost"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-sm">{localCommentCount}</span>
        </Button>

        {post?.category && (
          <p className="text-xs text-gray-500 font-medium">
            <span className="text-gray-400">Category:</span> {post.category}
          </p>
        )}
      </footer>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePost}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}