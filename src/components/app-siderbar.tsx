"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Home, User, ChevronUp, Settings, Aperture, MessageSquareText } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import axios from "axios"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { useState } from "react"

export function AppSidebar() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const user = session?.user

  const items = [
    { title: "Home", url: "/feed", icon: Home },
    { title: "User", url: `/profile/${session?.user?.username || (session?.user as any)?._id}`, icon: User },
    { title: "Settings", url: "/profile/settings", icon: Settings },
  ]

  const helpActions = [
    { title: "Support", url: "#", icon: Aperture },
    { title: "Feedback", url: "#", icon: MessageSquareText },
  ]

  const handleSignoutClick = () => {
    if (!session) { toast.error("You are not signed in."); return }
    setOpen(true)
  }

  const confirmSignout = async () => {
    if (!session) { toast.error("You are not signed in."); return }
    try {
      await signOut({ callbackUrl: '/sign-in' })
      toast.success("Signed out successfully.")
    } catch {
      toast.error("An error occurred while signing out.")
    }
  }

  const handleProfile = async () => {
    if (!session) { toast.error("You are not signed in."); return }
    try {
      await axios.get(`/profile/${session.user?.username || (session.user as any)?._id}`)
      toast.success("Profile opened successfully.")
    } catch {
      toast.error("An error occurred while opening the profile.")
    }
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="bg-[#EFE9D5]" />

        <SidebarContent className="bg-[#EFE9D5] border-r border-amber-900 flex flex-col flex-1">

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              General
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="hover:bg-[#d4caa4] font-semibold text-black rounded-md">
                      <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Help
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {helpActions.map((helpAction) => (
                  <SidebarMenuItem key={helpAction.title}>
                    <SidebarMenuButton asChild className="hover:bg-[#d4caa4] font-semibold text-black rounded-md">
                      <a href={helpAction.url} className="flex items-center gap-3 px-3 py-2">
                        <helpAction.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{helpAction.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>

        <SidebarFooter className="bg-[#EFE9D5] border-t border-r md:border-r border-amber-900 px-2 pb-4">
          <SidebarMenu>
            <SidebarMenuItem className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full flex items-center gap-2 cursor-pointer rounded-md bg-[#e9ddb3] hover:bg-[#a79968] border border-amber-900 px-3 py-2 text-black transition-colors">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left font-semibold text-sm truncate">
                      {user?.username ?? user?.name ?? "User"}
                    </span>
                    <ChevronUp className="w-4 h-4 shrink-0 text-gray-500" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="top"
                  sideOffset={8}
                  className="w-48 rounded-lg bg-[#EFE9D5] border border-amber-900 p-1.5"
                >
                  <DropdownMenuItem
                    onClick={handleProfile}
                    className="hover:bg-[#d4caa4] rounded-md px-3 py-2 text-sm cursor-pointer font-semibold"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-amber-900/30 my-1" />
                  <DropdownMenuItem
                    onClick={handleSignoutClick}
                    className="hover:bg-[#d4caa4] rounded-md px-3 py-2 text-sm text-red-600 font-semibold cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </Sidebar>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#EFE9D5] border border-black border-b-2 mx-4 sm:mx-auto max-w-sm sm:max-w-md w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription className="font-semibold">
              You can sign back in anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="border border-amber-900 w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSignout}
              className="text-white bg-red-600 hover:bg-red-800 w-full sm:w-auto"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}