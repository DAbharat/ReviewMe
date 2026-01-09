"use client"
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import CommentForm from './CommentForm'
import CommentCard from './CommentCard'
import useComments from './useComments'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"



export type Comment = {
    _id: string
    content: string
    postId: string
    userId: string | { _id: string; username?: string; imageUrl?: string }
}

export default function CommentPage({ postId }: { postId: string }) {

    const { data: session } = useSession()
const [open, setOpen] = useState(false)
const [selectedComment, setSelectedComment] = useState<string | null>(null)

    const getUserId = (c: Comment) => typeof c.userId === 'string' ? c.userId : c.userId?._id
    const isOwner = (c: Comment) => !!session?.user?._id && session.user._id === String(getUserId(c))

    const {
        comments,
        createComment,
        updateComment,
        deleteComment,
    } = useComments(postId)

    const handleEdit = (c: Comment) => {
        if (!session) {
            toast.error("Sign in required")
            return
        }

        if (!isOwner(c)) {
            toast.error('Not allowed')
            return
        }

        const text = prompt('Edit comment', c.content)
        if (!text?.trim()) return

        updateComment(c._id, text.trim())
    }

    const handleDelete = (c: Comment) => {
        if (!session) {
            toast.error("Sign in required")
            return
        }

        if (!isOwner(c)) {
            toast.error("Cannot delete this comment")
            return
        }

        setSelectedComment(c._id)
        setOpen(true)
    }

    const confirmDelete = async() => {

        if(!selectedComment) {
            toast.error("No comment selected")
            return
        }

        try {
            const result = await deleteComment(selectedComment)
            toast.success("Comment deleted")
            setOpen(false)
            setSelectedComment(null)
        } catch (error) {
            toast.error((error as Error).message || "Error deleting comment")
        } finally {
            setOpen(false)
            setSelectedComment(null)
        }
    }

    return (
        <div className="mt-6 space-y-6">

            {/* <CommentForm
                value={content}
                onChange={setContent}
                onSubmit={() => createComment(content)}
                isLoading={isLoading}
            /> */}

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                    comments.map((c: Comment) => {
                        const user = typeof c.userId === 'string' ? null : c.userId

                        return (
                            <CommentCard
                                key={c._id}
                                username={user?.username}
                                imageUrl={user?.imageUrl}
                                content={c.content}
                                isOwner={isOwner(c)}
                                onEdit={() => handleEdit(c)}
                                onDelete={() => handleDelete(c)}
                                onReport={() => toast.success('Reported')}
                            />
                        )
                    })
                    
                )
                }
            </div>
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete comment?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>

      <AlertDialogAction
        onClick={confirmDelete}
        className="bg-red-600 hover:bg-red-700"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
        </div>
    )
}