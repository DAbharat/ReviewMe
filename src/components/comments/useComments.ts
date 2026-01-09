import { useEffect, useState, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Comment } from './CommentPage'

export default function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)

//   console.log(postId, comments)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get<ApiResponse<Comment[]>>(
        `/api/posts/${postId}/comments`
      )
      setComments(res.data.data ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (postId) fetchComments()
  }, [postId, fetchComments])

  const createComment = async (content: string) => {
    try {
        const res = await axios.post<ApiResponse<Comment>>(
          `/api/posts/${postId}/comments`,
          { content }
        )
        setComments((prev) => [res.data.data, ...prev])
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        throw new Error(axiosError.response?.data.message || "Failed to create comment.")
    }
  }

  const updateComment = async (commentId: string, content: string) => {
    try {
        await axios.put(`/api/posts/${postId}/comments/${commentId}`, { content })
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, content } : c))
        )
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        throw new Error(axiosError.response?.data.message || "Failed to update comment.")
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
        
        await axios.delete(`/api/posts/${postId}/comments/${commentId}`)
        setComments((prev) => prev.filter((c) => c._id !== commentId))
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        throw new Error(axiosError.response?.data.message || "Failed to delete comment.")
    }
  }

  return {
    comments,
    isLoading,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  }
}
