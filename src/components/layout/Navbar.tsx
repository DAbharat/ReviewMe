"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from '../ui/button'



export default function Navbar() {

    const { data: session } = useSession()
    const user = session?.user 


    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#BBC7A4] border-b-2 border-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="font-semibold text-lg text-[#0f2430]">ReviewMe</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        

                        {session ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-[#0f2430]">Welcome {user?.username ?? user?.name ?? "User"}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-black bg-white text-[#0f2430]"
                                    onClick={() => signOut()}
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/sign-in">
                                    <Button variant="outline" size="sm" className="border-2 border-black bg-white text-[#0f2430]">
                                        Sign In
                                    </Button>
                                </Link>

                                <Link href="/sign-up">
                                    <Button size="sm" className="bg-[#bff0a0] border-2 border-black text-[#0f2430]">
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

