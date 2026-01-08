"use client"
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import CommentForm from './CommentForm'
import CommentCard from './CommentCard'


export type Comment = {
    _id: string
    content: string
    postId: string
    userId: string | { _id: string; username?: string; imageUrl?: string }
}

export default function CommentPage({ postId }: { postId: string }) {

    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [content, setContent] = useState("")
    const [comments, setComments] = useState<Comment[]>([])
    const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const getUserId = (c: Comment) => typeof c.userId === 'string' ? c.userId : c.userId?._id
    const isOwner = (c: Comment) => !!session?.user?._id && session.user._id === String(getUserId(c))

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await axios.get<ApiResponse<Comment[]>>(
                    `/api/posts/${postId}/comments`
                )
                setComments(res.data.data)
            } catch (error) {
                console.error("Error fetching comments", error)
            }
        }

        fetchComments()
    }, [postId])


    const createComment = async (content: string) => {
        console.log(session)
        if (!session) {
            toast.error("You must be signed in to post a comment.")
            return
        }

        try {

            setIsLoading(true)

            const result = await axios.post<ApiResponse<Comment>>(`/api/posts/${postId}/comments`, { content, postId })

            setComments((prev) => [result.data.data, ...prev])
            setContent("")
            toast.success("Comment posted successfully.")

            const res = await axios.get(`/api/posts/${postId}/comments`);
            setComments(res.data.data)

        } catch (error) {

            const axiosError = error as AxiosError<ApiResponse>
            console.log(axiosError.response?.data);
            if (axiosError.response) {
                toast.error(axiosError.response.data.message || "An error occurred while posting the comment.")
            } else {
                toast.error("An error occurred while posting the comment.")
            }

        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!session) {
            toast.error('You must be signed in to delete a comment.')
            return
        }

        const comment = comments.find((c) => c._id === commentId)
        if (!comment) {
            toast.error('Comment not found')
            return
        }

        if (!isOwner(comment)) {
            toast.error('You can only delete your own comments.')
            return
        }

        setDeleteCommentId(commentId)
        setMenuOpen(false)
        setOpen(true)
    }

    const confirmDeleteComment = async () => {

        if(!deleteCommentId) {
            toast.error("No comment selected for deletion.")
            return
        }

        try {

            setIsLoading(true)

            const result = await axios.delete<ApiResponse>(`/api/posts/${postId}/comments/${deleteCommentId}`)
            setComments((prev) => prev.filter((c) => c._id !== deleteCommentId))
            toast.success("Comment deleted successfully.")
            setDeleteCommentId(null)
            router.refresh()
            setOpen(false)

        } catch (error) {

            const axiosError = error as AxiosError<ApiResponse>
            if (axiosError.response) {
                toast.error(axiosError.response.data.message || "An error occurred while deleting the comment.")
            } else {
                toast.error("An error occurred while deleting the comment.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const updateComment = async (postIdParam: string, commentId: string, content: string) => {
        if (!session) {
            toast.error('You must be signed in to update a comment.')
            return
        }

        const comment = comments.find((c) => c._id === commentId)
        if (!comment) {
            toast.error('Comment not found')
            return
        }

        if (!isOwner(comment)) {
            toast.error('You can only update your own comments.')
            return
        }

        try {
            setIsLoading(true)

            await axios.put<ApiResponse>(`/api/posts/${postIdParam}/comments/${commentId}`, { content })
            // update local state
            setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, content } : c)))
            toast.success('Comment updated successfully.')

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || 'An error occurred while updating the comment.')
        } finally {
            setIsLoading(false)
        }
    }




    return (
        <div className="mt-6 space-y-6">
            
            <CommentForm
                value={content}
                onChange={setContent}
                onSubmit={() => createComment(content)}
                isLoading={isLoading}
            />

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                    comments.map((c) => {
                        const user =
                            typeof c.userId === "string" ? null : c.userId

                            return (
                                <CommentCard
                                    key={c._id}
                                    username={user?.username ?? 'User'}
                                    imageUrl={user?.imageUrl}
                                    content={c.content}
                                    isOwner={isOwner(c)}
                                    onDelete={() => handleDeleteComment(c._id)}
                                    onEdit={(newContent) => updateComment(postId, c._id, newContent)}
                                    onReport={() => toast.success('Comment reported.')}
                                />
                            )
                    })
                )}
            </div>
        </div>
    )
}