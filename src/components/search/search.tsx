"use client"
import React, { useEffect, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Search } from "lucide-react"
import { useDebounceValue } from 'usehooks-ts'
import { useRouter } from 'next/navigation'

export default function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [text, setText] = useState("")
  const router = useRouter()

  const handleSubmit = () => {
    if(!text.trim()) return

    router.push(`/feed?search=${encodeURIComponent(text)}`)
  }

  return (
    <div className="w-full">
      <InputGroup className='border border-black border-b-2 w-full h-8 sm:h-9 flex items-center'>
        <InputGroupInput
        autoFocus={autoFocus}
        className=' placeholder:text-gray-400 font-semibold'
          value={text}
          onChange={(e) => setText((e.target as HTMLInputElement).value)}
          onSubmit={handleSubmit}
          placeholder="Search..."
          onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
