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
      const [isUploading, setIsUploading] = useState(false)
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

          if (!imageUrl || !(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            toast.error('Please upload a valid image before creating the post.')
            setIsLoading(false)
            return
          }

          const finalCategory = (postType || category) || 'Other'

          const payload: Payload = {
            title,
            description: description || undefined,
            imageUrl: imageUrl,
            imagePublicId: imagePublicId || "",
            category: finalCategory,
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
        uploadImage(f)
      }
    }

    const uploadImage = async (file: File) => {
      try {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)


        const res = await axios.post<ApiResponse<{ imageUrl: string; publicId: string }>>('/api/image-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        const data = res.data

        if (res.status !== 200 || !data?.success) {
          throw new Error(data?.message || 'Image upload failed')
        }

        setImageUrl(data.data?.imageUrl || '')
        setImagePublicId(data.data?.publicId || '')
        toast.success('Image uploaded')
      } catch (err) {
        console.error('Upload error', err)
        toast.error((err as Error).message || 'Image upload failed')
        setImageUrl('')
        setImagePublicId('')
        setFile(null)
      } finally {
        setIsUploading(false)
      }
    }



    return (
      <div className="min-h-screen w-full bg-[#EFE9D5] flex items-start py-12 px-2 justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-[#e8e0c3] border border-black border-b-2 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Create Post</h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Post Title</label>
                <InputGroup className='border border-black border-b-2'>
                  <InputGroupInput className="w-full font-semibold" placeholder="Enter post title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                  <InputGroupAddon align="inline-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InputGroupButton className="rounded-full hover:bg-[#a79968]" size="icon-xs">
                          <IconInfoCircle />
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent className='font-semibold'>Be steady with your words.</TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Poll <p className='font-semibold opacity-30 inline ml-0.5'>(pre-defined)</p>
                </label>
                <div className=" border border-black border-b-2 rounded-md p-3 bg-[#EFE9D5]">
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="font-bold bg-[#e8e0c3] hover:bg-[#e8e0c3] shadow-sm border-black border-b-2">Worth it</Button>
                    <Button variant="outline" className="font-bold bg-[#e8e0c3] hover:bg-[#e8e0c3] shadow-sm border-black border-b-2">Not worth it</Button>
                    <Button variant="outline" className="font-bold bg-[#e8e0c3] hover:bg-[#e8e0c3] shadow-sm border-black border-b-2">Maybe</Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <InputGroup className='  border border-black border-b-2'>
                  <InputGroupTextarea placeholder="Give a little description about this post..." className="w-full font-semibold rounded-md" value={description} onChange={(e) => setDescription(e.target.value)}/>
                    
                    {imageUrl && (
                    <div className="w-full mb-3 rounded-md overflow-hidden pl-4 pr-4">
                      <img src={imageUrl} alt="preview" className="w-full h-64 object-cover block rounded-xl" />
                    </div>
                  )}
                  <InputGroupAddon align="block-end">
                    <InputGroupButton
                      variant="outline"
                      className="rounded-full border border-black border-b-2"
                      size="icon-xs"
                    >
                      <label className="flex items-center cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <IconPlus />
                      </label>
                    </InputGroupButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <InputGroupText className='font-bold'>Upload Image</InputGroupText>
                      </DropdownMenuTrigger>
                    </DropdownMenu>
                    <Separator orientation="vertical" className="h-4!" />
                  </InputGroupAddon>

                  
                </InputGroup>
                <div className='mt-4'>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <div className="flex items-start gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className='font-bold bg-[#EFE9D5] border border-black border-b-2 '>Select Category</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56'>
                          <DropdownMenuLabel className='font-bold'>Select a Category</DropdownMenuLabel>
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
                        <div className="border border-black border-b-2 p-2 bg-[#EFE9D5] max-h-9 flex flex-wrap items-center gap-2 rounded-sm">
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
                            <span className="text-sm text-gray-500 font-semibold">No categories selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={createPost} size="lg" disabled={isLoading || isUploading}>
                  {isUploading ? 'Uploading image...' : isLoading ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

