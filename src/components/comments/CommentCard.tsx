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
    <article className="bg-[#EFE9D5] border border-black border-b-2 rounded-2xl p-4">
      <div className="flex gap-3">
        {imageUrl ? (
          <img src={imageUrl} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-black text-white text-md flex items-center justify-center">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-semibold text-sm">{username}</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='bg-[#EFE9D5] border border-black border-b-2 hover:bg-[#a79968]' size="icon" variant="ghost">
                  <MoreHorizontal className="w-4 h-4 " />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-[#EFE9D5] border border-black border-b-2" align="end">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={onEdit} className='font-bold cursor-pointer'>
                      <PencilLine className="w-4 h-4 mr-2 " /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 hover:bg-red-800 font-bold cursor-pointer">
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={onReport} className='font-bold text-red-600 hover:bg-red-800 cursor-pointer'>
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
