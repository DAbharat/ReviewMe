"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { MoreHorizontal, Trash, PencilLine, Flag } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'

type CommentCardProps = {
  username?: string
  imageUrl?: string
  content: string
  isOwner?: boolean
  onEdit?: (newContent: string) => void
  onDelete?: () => void
  onReport?: () => void
}

export default function CommentCard({
  username = 'User',
  imageUrl,
  content,
  isOwner = false,
  onEdit,
  onDelete,
  onReport,
}: CommentCardProps) {
  const { data: session } = useSession()

  const handleEdit = () => {
    if (!session) return toast.error('You must be authenticated to edit.')
    if (!isOwner) return toast.error('You can only edit your own comment.')
    const newContent = prompt('Edit your comment', content)
    if (newContent === null) return
    const trimmed = newContent.trim()
    if (!trimmed) return toast.error('Comment cannot be empty')
    onEdit?.(trimmed)
  }

  const handleDelete = () => {
    if (!session) return toast.error('You must be authenticated to delete.')
    if (!isOwner) return toast.error('You can only delete your own comment.')
    if (!confirm('Delete this comment?')) return
    onDelete?.()
  }

  const handleReport = () => {
    if (!session) return toast.error('You must be authenticated to report.')
    onReport?.()
  }

  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-start gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-gray-900">{username}</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2">
                      <PencilLine className="w-4 h-4" />
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-2 text-red-600">
                      <Trash className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleReport} className="flex items-center gap-2 text-red-500">
                    <Flag className="w-4 h-4" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-1 text-sm text-gray-700 leading-relaxed">{content}</p>
        </div>
      </header>
    </article>
  )
}

