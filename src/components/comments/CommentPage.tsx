"use client"

import { useSession } from "next-auth/react"
import React, { useState } from "react"
import { toast } from "sonner"
import CommentCard from "./CommentCard"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog"

export type Comment = {
    _id: string
    content: string
    postId: string
    userId: string | { _id: string; username?: string; imageUrl?: string }
}

export default function CommentPage({
    comments,
    onUpdate,
    onDelete,
}: {
    comments: Comment[]
    onUpdate: (id: string, content: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
}) {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const [selectedComment, setSelectedComment] = useState<string | null>(null)

    const getUserId = (c: Comment) =>
        typeof c.userId === "string" ? c.userId : c.userId._id

    const isOwner = (c: Comment) =>
        !!session?.user?._id && session.user._id === String(getUserId(c))

    const handleEdit = async (c: Comment) => {
        if (!session) return toast.error("Sign in required")
        if (!isOwner(c)) return toast.error("Not allowed")

        const text = prompt("Edit comment", c.content)
        if (!text?.trim()) return

        await onUpdate(c._id, text.trim())
    }

    const handleDelete = (c: Comment) => {
        if (!session) return toast.error("Sign in required")
        if (!isOwner(c)) return toast.error("Cannot delete this comment")

        setSelectedComment(c._id)
        setOpen(true)
    }

    const confirmDelete = async () => {
        if (!selectedComment) return

        try {
            await onDelete(selectedComment)
            toast.success("Comment deleted")
        } catch (err) {
            toast.error("Error deleting comment")
        } finally {
            setOpen(false)
            setSelectedComment(null)
        }
    }

    return (
        <div className="mt-6 space-y-6 bg-[#EFE9D5]">
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                    comments.map((c) => {
                        const user =
                            c.userId && typeof c.userId === "object" && "username" in c.userId
                                ? c.userId
                                : null

                        ///console.log("user: ", user)

                        return (
                            <CommentCard
                                key={c._id}
                                username={user?.username}
                                imageUrl={user?.imageUrl}
                                content={c.content}
                                isOwner={isOwner(c)}
                                onEdit={() => handleEdit(c)}
                                onDelete={() => handleDelete(c)}
                                onReport={() => toast.success("Reported")}
                            />
                        )
                    })
                )}
            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="bg-[#EFE9D5] border border-black border-b-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-bold">
                            Delete comment?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-semibold">
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border border-amber-900">
                            Cancel
                        </AlertDialogCancel>
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
