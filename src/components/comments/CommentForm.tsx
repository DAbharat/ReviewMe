"use client"
import React, { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'


export default function CommentForm({
  value,
  onChange,
  onSubmit,
  isLoading,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  isLoading: boolean
}) {
  return (
    <div className="relative w-full">
  <Textarea
    placeholder="Write your comment..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="pr-10 pb-10 resize-none"
  />

  <Button
    onClick={onSubmit}
    disabled={isLoading || !value.trim()}
    size="icon"
    className="absolute bottom-5 right-3 h-8 w-8 rounded-full"
  >
    <ArrowUpIcon className="h-4 w-4" />
  </Button>
</div>

  )
}


