"use client"
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'
import { Button } from '../ui/button'
import { Trash } from 'lucide-react'
import SettingsBG from './SettingsBG'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

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
      await axios.delete(`/api/users/me`)
      toast.success("Account deleted successfully.")
      await signOut({ callbackUrl: "/feed" })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "Error deleting account.")
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="bg-[#EFE9D5] min-h-screen py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SettingsBG />

        <div className="mt-5 sm:mt-6 bg-white border border-amber-900 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">

            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <h2 className="text-red-600 font-bold text-lg sm:text-xl">Delete Account</h2>
              <p className="font-medium text-sm text-gray-700 leading-relaxed">
                This action is permanent and cannot be undone. All your posts, comments, and data will be removed from our servers.
              </p>
            </div>

            <div className="shrink-0">
              <Button
                onClick={handleDeleteAccount}
                className="border border-red-600 border-b-2 bg-white hover:bg-red-50 text-red-700 px-5 py-2.5 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Trash size={16} />
                <span>Delete Account</span>
              </Button>
            </div>
          </div>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="bg-[#EFE9D5] border border-black border-b-2 mx-4 sm:mx-auto max-w-sm sm:max-w-md w-full">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold text-base sm:text-lg">
                Are you sure you want to delete your account?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-semibold text-sm">
                You will lose all your data including posts and comments. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="border border-amber-900 w-full sm:w-auto" disabled={isLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAccount}
                disabled={isLoading}
                className="text-white bg-red-600 hover:bg-red-800 w-full sm:w-auto"
              >
                {isLoading ? "Deleting..." : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}