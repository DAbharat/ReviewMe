"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '../ui/button'
import { SidebarTrigger } from '../ui/sidebar'
import { useRouter } from "next/navigation"
import { User } from 'lucide-react'
import SearchBar from '../search/search'
import { Search } from 'lucide-react'


export default function Navbar() {

    const { data: session } = useSession()
    const user = session?.user
    const router = useRouter()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EFE9D5] border-b-2 border-black/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="mr-2 md:hidden">
                            <SidebarTrigger />
                        </div>
                        <Link href="/" className="flex items-center gap-2 lg:gap-4">
                            <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EFE9D5] border border-black font-bold text-sm sm:text-base text-[#0f2430]">RM</span>
                            <span className="hidden md:block text-lg font-bold text-black tracking-tight whitespace-nowrap">
                                Review<span className="font-bold">Me</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex flex-1 mx-3 sm:mx-4 lg:max-w-xl">
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-[#0f2430] font-medium hidden sm:block">
                                    Welcome, {user?.username ?? user?.name ?? "User"}
                                </span>
                                {(() => {
                                    const profileSlug = user?.username ?? (user as any)?._id ?? null
                                    return (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-black border-b-3 bg-[#EFE9D5] text-[#0f2430] hover:bg-[#a79968] transition-colors h-9 w-9 p-0"
                                            onClick={() => profileSlug && router.push(`/profile/${profileSlug}`)}
                                            aria-label="Open profile"
                                        >
                                            <User className="h-4 w-4" />
                                        </Button>
                                    )
                                })()}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-black border-b-3 bg-[#EFE9D5] text-[#0f2430] hover:bg-[#a79968] transition-colors font-medium px-4 h-9"
                                    onClick={() => router.push(`/post/create`)}
                                >
                                    Create Post
                                </Button>
                            </div>
                        ) : (
                            <Link href="/sign-in">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border border-black border-b-2 bg-[#ebdfbb] hover:bg-[#a79968] text-black transition-colors font-medium text-xs sm:text-sm px-2 h-8 sm:px-4 sm:h-9"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}