"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '../ui/button'
import { SidebarTrigger } from '../ui/sidebar'
import { useRouter } from "next/navigation"
import { User } from 'lucide-react'
import SearchBar from '../search/search'


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
                        <Link href="/" className="flex items-center">
                            <span className="font-bold text-xl text-[#0f2430] tracking-tight">ReviewMe</span>
                        </Link>
                    </div>

                    <SearchBar />

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
                            <div className="flex items-center gap-3">
                                <Link href="/sign-in">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border border-black border-b-2 bg-[#ebdfbb] hover:bg-[#a79968] text-black transition-colors font-medium px-4 h-9"
                                    >
                                        Sign In
                                    </Button>
                                </Link>

                                <Link href="/sign-up">
                                    <Button 
                                        size="sm" 
                                        className="bg-[#ebdfbb] border border-black border-b-2 text-black hover:bg-[#a79968] transition-colors font-medium px-4 h-9"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}