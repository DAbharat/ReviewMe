"use client"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { ArrowUpIcon, Search } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { IconCheck, IconInfoCircle, IconPlus } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'


type Checked = DropdownMenuCheckboxItemProps["checked"]

export interface Payload {
  title: string,
  description?: string,
  imageUrl: string,
  imagePublicId: string,
  category?: string
};

export default function Page() {

    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [imageUrl, setImageUrl] = useState<string>('')
    const [imagePublicId, setImagePublicId] = useState<string>('')
    const [category, setCategory] = useState<string>('')
    const [postType, setPostType] = useState<string>('')
    const [file, setFile] = useState<File | null>(null)

    const [isLoading, setIsLoading] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const [showProduct, setShowProduct] = useState<Checked>(false)
    const [showSeries, setShowSeries] = useState<Checked>(false)
    const [showMovie, setShowMovie] = useState<Checked>(false)
    const [showApp, setShowApp] = useState<Checked>(false)
    const [showGame, setShowGame] = useState<Checked>(false)
    const [showSport, setShowSport] = useState<Checked>(false)
    const [showTechnology, setShowTechnology] = useState<Checked>(false)
    const [showCelebrity, setShowCelebrity] = useState<Checked>(false)
    const [showOther, setShowOther] = useState<Checked>(false)

    const createPost = async () => {
        if (!session) {
            toast.error("You must be signed in to create a post.")
            return
        }

        try {
            setIsLoading(true)

            const payload: Payload = {
                title,
                description: description || undefined,
                imageUrl,
                imagePublicId,
                category: postType || category || undefined,
            }

            await axios.post<ApiResponse>(`/api/posts`, payload)
            toast.success("Post created successfully.")
            router.push(`/`)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "An error occurred while creating the post.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) {
        setFile(f)
        setImageUrl(URL.createObjectURL(f))
      }
    }



    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-4xl">
          <div className="bg-white border rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Create Post</h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Post Title</label>
                <InputGroup>
                  <InputGroupInput className="w-full" placeholder="Enter post title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                  <InputGroupAddon align="inline-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InputGroupButton className="rounded-full" size="icon-xs">
                          <IconInfoCircle />
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent>This is content in a tooltip.</TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Poll <p className='font-semibold opacity-30 inline ml-0.5'>(pre-defined)</p>
                </label>
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline">Worth it</Button>
                    <Button variant="outline">Not worth it</Button>
                    <Button variant="outline">Maybe</Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <InputGroup>
                  
                  <InputGroupTextarea placeholder="Give a little description about this post..." className="w-full" />
                    
                    {imageUrl && (
                    <div className="w-full mb-3 rounded-md overflow-hidden pl-4 pr-4">
                      <img src={imageUrl} alt="preview" className="w-full h-64 object-cover block rounded-xl" />
                    </div>
                  )}
                  <InputGroupAddon align="block-end">
                    <InputGroupButton
                      variant="outline"
                      className="rounded-full"
                      size="icon-xs"
                    >
                      <label className="flex items-center cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <IconPlus />
                      </label>
                    </InputGroupButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <InputGroupText>Upload Image</InputGroupText>
                      </DropdownMenuTrigger>
                    </DropdownMenu>
                    <Separator orientation="vertical" className="!h-4" />
                  </InputGroupAddon>

                  
                </InputGroup>
                <div className='mt-4'>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <div className="flex items-start gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Select Category</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56'>
                          <DropdownMenuLabel>Select a Category</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem checked={showProduct} onCheckedChange={setShowProduct}>Product</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showSeries} onCheckedChange={setShowSeries}>Series</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showMovie} onCheckedChange={setShowMovie}>Movie</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showApp} onCheckedChange={setShowApp}>App</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showGame} onCheckedChange={setShowGame}>Game</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showSport} onCheckedChange={setShowSport}>Sport</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showTechnology} onCheckedChange={setShowTechnology}>Technology</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showCelebrity} onCheckedChange={setShowCelebrity}>Celebrity</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={showOther} onCheckedChange={setShowOther}>Other</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="flex-1">
                        <div className="border p-2 bg-white max-h-9 flex flex-wrap items-center gap-2">
                          {showProduct && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Product</span>}
                          {showSeries && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Series</span>}
                          {showMovie && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Movie</span>}
                          {showApp && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">App</span>}
                          {showGame && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Game</span>}
                          {showSport && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Sport</span>}
                          {showTechnology && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Technology</span>}
                          {showCelebrity && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Celebrity</span>}
                          {showOther && <span className="inline-flex items-center gap-2 px-1 py-0 bg-gray-200 text-sm">Other</span>}
                          {!showProduct && !showSeries && !showMovie && !showApp && !showGame && !showSport && !showTechnology && !showCelebrity && !showOther && (
                            <span className="text-sm text-gray-500">No categories selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={createPost} size="lg">Create Post</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

