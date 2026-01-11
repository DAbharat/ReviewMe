"use client"

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useEffect, useState, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

type PollOptionProps = {
  postId: string
  pollRefreshIntervalMs?: number
}

type PollItem = { label: string; votes: number }

export default function PollOption({
  postId,
  pollRefreshIntervalMs = 5000,
}: PollOptionProps) {

  const options = ['Worth it', 'Not Worth it', 'Maybe']

  const [pollResults, setPollResults] = useState<PollItem[]>(
    options.map(label => ({ label, votes: 0 }))
  )
  const [totalVotes, setTotalVotes] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const fetchPoll = useCallback(async () => {
    if (!postId) return

    try {
      const res = await axios.get(`/api/posts/${postId}/poll`)

      if (!res.data?.success) return

      const { poll, totalVotes, userVotedOption } = res.data.data

      const mapped: PollItem[] = options.map(label => {
        const found = poll?.find((p: any) => p.label === label)
        return { label, votes: found?.votes ?? 0 }
      })

      setPollResults(mapped)
      setTotalVotes(totalVotes ?? 0)

      if (userVotedOption) {
        setHasVoted(true)
        setSelectedOption(userVotedOption)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.error('Fetch poll error', axiosError.response?.data || axiosError)
    }
  }, [postId])

  useEffect(() => {
    fetchPoll()

    
  }, [fetchPoll])

  const handleVote = async (optionLabel: string) => {
    if (!postId || hasVoted || isVoting) return

    setIsVoting(true)
    setSelectedOption(optionLabel)

    setPollResults(prev =>
      prev.map(p =>
        p.label === optionLabel ? { ...p, votes: p.votes + 1 } : p
      )
    )
    setTotalVotes(t => t + 1)

    try {
      await axios.post(`/api/posts/${postId}/vote`, { option: optionLabel })
      toast.success(`You voted "${optionLabel}"`)
          setHasVoted(true)
await fetchPoll()
    } catch (error) {
      toast.error('Vote failed, try after sometime')
      setHasVoted(false)
      setSelectedOption(null)
      fetchPoll()
    } finally {
      setIsVoting(false)
    }
  }

  const percent = (votes: number) =>
    totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100)

  return (
    <div className="pt-3 w-full max-w-xs bg-[#e8e0c3] pl-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        What do you think?
      </h3>

      <RadioGroup
  value={selectedOption ?? undefined}
  onValueChange={handleVote}
 
>

  <div className="space-y-3">
    {pollResults.map((opt) => (
      <div key={opt.label} className="flex items-center gap-3">
        <div className="flex-1">
          <div className="relative h-9 rounded-md bg-gray-100 border border-black overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-linear-to-r bg-gray-300 opacity-80"
              style={{ width: `${percent(opt.votes)}%` }}
            />

            <div className="relative z-10 flex items-center px-3 h-full gap-2">
              <RadioGroupItem
                value={opt.label}
                id={opt.label}
                disabled={hasVoted || isVoting}
              />
              <Label
                htmlFor={opt.label}
                className="text-sm font-medium text-gray-800 cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          </div>
        </div>

        <div className="w-12 text-right text-sm font-medium text-gray-600">
          {percent(opt.votes)}%
        </div>
      </div>
    ))}
  </div>
</RadioGroup>


      <div className="mt-1 text-sm text-gray-500">
        <span className="inline-block rounded-full bg-[#e8e0c3] px-3 py-1 text-xs font-medium">
          {totalVotes} votes
        </span>
      </div>
    </div>
  )
}
