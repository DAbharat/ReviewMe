"use client"
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useEffect, useState, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { toast } from 'sonner'


type PollOptionProps = {
    postId: string
    pollRefreshIntervalMs?: number
}

type PollItem = { label: string; votes: number }

export default function PollOption({ postId, pollRefreshIntervalMs = 5000 }: PollOptionProps) {

    const options = ['Worth it', 'Not Worth it', 'Maybe']
    const [pollResults, setPollResults] = useState<PollItem[]>(() =>
        options.map((label) => ({ label, votes: 0 }))
    )

    const [totalVotes, setTotalVotes] = useState<number>(0)
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

    const fetchPoll = useCallback(async () => {

        if (!postId) {
            return
        }

        try {

            const res = await axios.get(`/api/posts/${postId}/poll`)

            if (res?.data?.success) {

                const { poll, totalVotes } = res.data.data
                const mapped: PollItem[] = options.map((label) => {
                    const found = (poll || []).find((p: any) => p.label === label)
                    return { label, votes: found?.votes ?? 0 }
                })

                setPollResults(mapped)
                setTotalVotes(totalVotes ?? mapped.reduce((s: number, p: any) => s + (p.votes || 0), 0))
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error('Fetch poll error', axiosError.response?.data || axiosError)
        }
    }, [postId])

    useEffect(() => {
        // initialize voted state from localStorage so remounts keep poll disabled
        try {
            if (postId) {
                const stored = localStorage.getItem(`poll_voted_${postId}`)
                if (stored) {
                    setHasVoted(true)
                    setSelectedOption(stored)
                }
            }
        } catch (e) {
            // ignore (SSR safety) - localStorage may be unavailable in some contexts
        }
        if (!postId) return

        if (hasVoted) {
            // If user already voted, don't start the polling interval for this component
            return
        }

        // initial fetch and regular polling while user hasn't voted
        fetchPoll()
        const id = setInterval(fetchPoll, pollRefreshIntervalMs)
        return () => clearInterval(id)

    }, [postId, fetchPoll, pollRefreshIntervalMs, hasVoted])

    const handleVote = async (optionLabel: string, idx: number) => {

        if (!postId) return

        // basic client-side ObjectId validation to avoid invalid requests
        if (!/^[0-9a-fA-F]{24}$/.test(postId)) {
            console.error('Invalid postId, aborting vote POST', postId)
            toast.error('Invalid post id — cannot record vote.')
            setIsVoting(false)
            setHasVoted(false)
            return
        }

        setIsVoting(true)
        setHasVoted(true)
        setSelectedOption(optionLabel)

        setPollResults((prev) => prev.map(p => p.label === optionLabel ? { ...p, votes: (p.votes || 0) + 1 } : p))
        setTotalVotes((t) => t + 1)

        try {

            const result = await axios.post(`/api/posts/${postId}/vote`, { option: optionLabel, postId })
            toast.success(`Your vote for "${optionLabel}" has been counted!`)

            try {
                localStorage.setItem(`poll_voted_${postId}`, optionLabel)
            } catch (e) {
                /* ignore */
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error('Vote POST error response:', axiosError.response?.data || axiosError)
            toast.error(axiosError.response?.data?.message || "An error occurred while recording your vote.")
        }

        setTimeout(() => {
            fetchPoll()
            setIsVoting(false)
        }, 1500)
    }

    const computePercent = (votes: number) => {
        if (totalVotes <= 0) return 0
        return Math.round((votes / totalVotes) * 100)
    }

    return (
        <div className="pb-4 w-full max-w-xs bg-white pl-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">What do you think?</h3>

            <RadioGroup>
                <div className="space-y-3">
                    {pollResults.map((opt, idx) => (
                        <div key={opt.label} className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="relative h-9 rounded-md bg-gray-100 overflow-hidden">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-linear-to-r from-violet-400 to-purple-500 opacity-80"
                                        style={{ width: `${Math.max(0, Math.min(100, computePercent(opt.votes)))}%` }}
                                    />
                                    <div className="relative z-10 flex items-center px-3 h-full">
                                        <RadioGroupItem value={`opt-${idx}`} id={`r${idx}`} disabled={isVoting || hasVoted} />
                                        <button
                                            onClick={() => handleVote(opt.label, idx)}
                                            className="ml-2 text-sm font-medium text-gray-800 text-left w-full"
                                            disabled={isVoting || hasVoted}
                                        >
                                            {opt.label}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-12 text-right text-sm font-medium text-gray-600">{computePercent(opt.votes)}%</div>
                        </div>
                    ))}
                </div>
            </RadioGroup>

            <div className="mt-3 text-sm text-gray-500">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{totalVotes} votes</span>
            </div>
        </div>
    )
}