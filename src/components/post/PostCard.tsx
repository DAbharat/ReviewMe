import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import Post from '@/model/post.model'
import { Heart, MessageSquare, MoreHorizontal, MessageCircle } from 'lucide-react'


export type Post = {
  createdBy: { username?: string; imageUrl?: string };
  title?: string;
  description?: string
  imageUrl?: string;
  commentCount?: number;
};

export default function PostCard({ post }: { post?: Post }) {
    const [isLoading, setIsLoading] = useState(false)
    const { data: session} = useSession()
    const router = useRouter()

    const handleDeletePost = async (postId: string) => {
        if(!session) {
            toast.error("You must be signed in to delete a post.")
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


  return (
    <article className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <header className="flex items-start gap-3">
        <img
          src={post?.createdBy?.imageUrl}
          alt={post?.createdBy?.username}
          className="w-11 h-11 rounded-full object-cover"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-card-foreground">
                {post?.createdBy?.username}
              </div>
            </div>
            <button
              aria-label="more"
              className="p-1 rounded hover:bg-accent/10 text-muted"
            >
              <MoreHorizontal />
            </button>
          </div>
          <p className="mt-3 text-lg font-bold text-black">
            {post?.title}
          </p>
          <p className="mt-3 text-sm font-semibold text-black">
            {post?.description}
          </p>
        </div>
      </header>

      {/* Media with gradient border + inner glow */}
      <div className="mt-4">
        <div className="rounded-2xl p-[3px] bg-gradient-to-r from-[#8b5cf6] via-[#60a5fa] to-[#7c3aed] relative overflow-visible">
          <div className="rounded-xl bg-card overflow-hidden relative">
            {/* soft inner glow behind image */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#8b5cf6]/30 via-[#60a5fa]/20 to-[#7c3aed]/20 blur-sm" />
            {post?.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="post media"
                className="w-full h-64 object-cover block"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-64 bg-muted" />
            )}
          </div>
        </div>
      </div>
 {/* Footer actions */}
      <footer className="mt-4 flex items-center justify-between text-xs font-semibold ">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 hover:text-card-foreground">
            <MessageCircle className="size-4 text-black" /> <span>{post?.commentCount}</span>
          </button>
        </div>
      </footer>
    </article>
  );

  
}

