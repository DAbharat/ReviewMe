import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, MessageCircle, Flag, Trash, PencilLine, Dot } from 'lucide-react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'


export type Post = {
  _id: string
  createdBy: { _id: string, username?: string; imageUrl?: string };
  title?: string;
  description?: string
  imageUrl?: string;
  commentCount?: number;
  category?:string
};

export default function PostCard({ post }: { post?: Post }) {
    const [isLoading, setIsLoading] = useState(false)
    const { data: session} = useSession()
    const router = useRouter()

    const isOwner =
  session?.user?.id &&
  post?.createdBy?._id === session.user.id

    const handleDeletePost = async (postId: string) => {
        if(!session) {
            toast.error("You must be signed in to delete a post.")
            return
        }

        if(!isOwner) {
          toast.error("You are not authorized to delete this post.")
          return
        }

    try {
        setIsLoading(true)

        const result = await axios.delete<ApiResponse>(`/api/posts/${postId}`)
        toast.success("Post deleted successfully.")
        router.refresh()        

    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast.error(axiosError.response?.data.message || "An error occurred while deleting the post.")
    } finally {
        setIsLoading(false)
    }
    }

    const updatePost = async (postId: string) => {
      
      if(!session) {
        toast.error("You must be signed in to update a post.")
        return
      }

      if(!isOwner) {
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


  return (
    <article className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <header className="flex items-start gap-3">
        <img
          src={post?.createdBy?.imageUrl}
          alt={post?.createdBy?.username}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              {post?.createdBy?.username}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More Options" 
                  className="p-2 rounded-full hover:bg-gray-50 text-gray-500 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={() => post?._id && updatePost(post._id)}
                      disabled={isLoading || !post?._id}>
                      <PencilLine className="w-4 h-4" /> Update Post
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => post?._id && handleDeletePost(post._id)}
                      disabled={isLoading || !post?._id}
                    >
                      <Trash className="w-4 h-4" /> Delete Post
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
          <p className="mt-3 text-base font-semibold text-gray-900 leading-snug">
            {post?.title}
          </p>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {post?.description}
          </p>
        </div>
      </header>

      {/* Media with softer gradient border */}
      <div className="mt-5">
        <div className="rounded-2xl p-[2px] bg-gradient-to-br from-violet-400/60 via-blue-400/60 to-purple-500/60 relative">
          <div className="rounded-2xl bg-white overflow-hidden relative">
            {post?.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="post media"
                className="w-full h-64 object-cover block"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100" />
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <footer className="mt-4 flex items-center text-sm">
        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-0">
            <MessageCircle className="w-5 h-5" /> 
            <span className="font-medium">{post?.commentCount}</span>
          </Button>
          <Dot className="text-gray-300 -mx-2" />
          <p className="text-gray-600 font-medium">
            <span className="text-gray-400">Category:</span> {post?.category}
          </p>
        </div>
      </footer>
    </article>
  );
}