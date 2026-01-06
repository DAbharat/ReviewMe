"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

import { Button } from '../ui/button'
import router, { useRouter } from "next/navigation"
import { User } from 'lucide-react'


export default function Navbar() {

    const { data: session } = useSession()
    const user = session?.user 
    const router = useRouter()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#BBC7A4] border-b-2 border-black/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <span className="font-bold text-xl text-[#0f2430] tracking-tight">ReviewMe</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-[#0f2430] font-medium hidden sm:block">
                                    Welcome, {user?.username ?? user?.name ?? "User"}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-black bg-white text-[#0f2430] hover:bg-[#0f2430] hover:text-white transition-colors h-9 w-9 p-0"
                                    onClick={() => router.push(`/api/profile/${user?.id}`)}
                                >
                                    <User className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-black bg-white text-[#0f2430] hover:bg-[#0f2430] hover:text-white transition-colors font-medium px-4 h-9"
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
                                        className="border-2 border-black bg-white text-[#0f2430] hover:bg-[#0f2430] hover:text-white transition-colors font-medium px-4 h-9"
                                    >
                                        Sign In
                                    </Button>
                                </Link>

                                <Link href="/sign-up">
                                    <Button 
                                        size="sm" 
                                        className="bg-[#bff0a0] border-2 border-black text-[#0f2430] hover:bg-[#a8d98f] transition-colors font-medium px-4 h-9"
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