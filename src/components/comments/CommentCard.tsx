"use client"
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
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
}

export default function CommentCard({
  username = 'User',
  imageUrl,
  content,
  isOwner,
  onEdit,
  onDelete,
  onReport,
}: CommentCardProps) {
  return (
    <article className="bg-white border rounded-2xl p-4">
      <div className="flex gap-3">
        {imageUrl ? (
          <img src={imageUrl} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {username.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-semibold text-sm">{username}</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={onEdit}>
                      <PencilLine className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={onReport}>
                    <Flag className="w-4 h-4 mr-2" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm mt-1">{content}</p>
        </div>
      </div>
    </article>
  )
}
