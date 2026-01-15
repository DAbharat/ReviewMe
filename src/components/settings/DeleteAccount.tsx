"use client"
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'
import { InputGroup, InputGroupText, InputGroupTextarea } from '../ui/input-group'
import { Button } from '../ui/button'
import { Trash } from 'lucide-react'
import SettingsBG from './SettingsBG'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { set } from 'mongoose'



export default function DeleteAccount() {

    const { data: session } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleDeleteAccount = async () => {

        if (!session) {
            toast.error("You must be signed in to delete your account.")
            return
        }
        setOpen(true)
    }

    const confirmDeleteAccount = async () => {

        try {
            setIsLoading(true)
            const deleteAccount = await axios.delete(`/api/users/me`)
            toast.success("Account deleted successfully.")
            await signOut({
                callbackUrl: "/feed"
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "Error deleting account.")
        } finally {
            setIsLoading(false)
            setOpen(false)
        }
    }

    return (
        <div className="bg-[#EFE9D5] min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <SettingsBG />

                <div className="mt-6 bg-white border border-amber-900 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1 space-y-3">
                            <h2 className="text-red-600 font-bold text-xl">Delete Account</h2>
                            <p className="font-medium text-sm text-gray-700 leading-relaxed max-w-2xl">
                                Note: This is not a reversible action. Once deleted, all your data will be permanently removed from our servers.
                            </p>
                        </div>

                        <div className="shrink-0 md:ml-6">
                            <Button
                                onClick={() => handleDeleteAccount()}
                                className="border border-red-600 border-b-2 bg-white hover:bg-red-50 text-red-700 px-6 py-3 flex items-center gap-2 w-full md:w-auto justify-center"
                            >
                                <Trash size={18} />
                                <span>Delete Account</span>
                            </Button>
                        </div>
                    </div>

                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogContent className="bg-[#EFE9D5] border border-black border-b-2">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-bold">Are you sure you want to delete your account?</AlertDialogTitle>
                                <AlertDialogDescription className="font-semibold">
                                    You will lose all your data including posts and comments. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border border-amber-900">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteAccount} className="text-white bg-red-600 hover:bg-red-800">
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}