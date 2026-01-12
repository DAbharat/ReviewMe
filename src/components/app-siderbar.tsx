"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
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
import { Plus, Home, User, User2, ChevronUp, Settings, Aperture, MessageSquareText } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import axios from "axios"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { useState } from "react"



export function AppSidebar() {

  const [open, setOpen] = useState(false)

  const { data: session } = useSession()

  const items = [
  { title: "Home", url: "/feed", icon: Home },
  { title: "User", url: `/profile/${session?.user?.username || (session?.user as any)?._id}`, icon: User },
  { title: "Settings", url: "#", icon: Settings },
]

const helpActions = [
  { title: "Support", url: "#", icon: Aperture },
  { title: "Feedback", url: "#", icon: MessageSquareText },
]


  const handleSignoutClick = () => {
    if (!session) {
      toast.error("You are not signed in.")
      return
    }
    setOpen(true)
  }


  const confirmSignout = async () => {
    if (!session) {
      toast.error("You are not signed in.")
      return
    }

    try {
      await signOut({
        callbackUrl: '/sign-in'
      })
      toast.success("Signed out successfully.")
    } catch (error) {
      toast.error("An error occurred while signing out.")
    }
  }

  const handleProfile = async () => {
    if (!session) {
      toast.error("You are not signed in.")
      return
    }

    try {
      await axios.get(`/profile/${session.user?.username || (session.user as any)?._id}`)
      toast.success("Profile opened successfully.")
    } catch (error) {
      toast.error("An error occurred while opening the profile.")
    }
  }


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-[#EFE9D5]" />

      <SidebarContent className="bg-[#EFE9D5] border border-amber-900" >

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-black">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className=" hover:bg-[#d4caa4] font-semibold">
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-black">
              {helpActions.map((helpAction) => (
                <SidebarMenuItem key={helpAction.title}>
                  <SidebarMenuButton asChild className=" hover:bg-[#d4caa4] font-semibold">
                    <a href={helpAction.url} className="flex items-center gap-2">
                      <helpAction.icon />
                      <span>{helpAction.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto px-3 pb-15">
          <SidebarMenu>
            <SidebarMenuItem className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full flex items-center gap-3 sm:gap-6 cursor-pointer rounded-md bg-[#e9ddb3] hover:bg-[#a79968] border border-amber-900 px-3 py-2 text-black">
                    <User />
                    <span className="flex-1 text-left font-semibold">{session?.user?.username || "User"}</span>
                    <ChevronUp className="ml-2" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" sideOffset={8} className="w-48 rounded-lg bg-[#EFE9D5] border border-amber-900 p-2 ">
                  <DropdownMenuItem
                    onClick={handleProfile}
                    className="bg-[#EFE9D5] hover:bg-[#d4caa4] w-full px-3 py-2 text-sm cursor-pointer font-semibold"
                  >
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="text-amber-900 font-bold" />

                  <DropdownMenuItem
                    onClick={handleSignoutClick}
                    className="bg-[#EFE9D5] hover:bg-[#d4caa4] w-full px-3 py-2 text-sm text-red-600 font-semibold cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>


                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="bg-[#EFE9D5] border border-black border-b-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold">Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription className="font-semibold">
                You can sign back in anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border border-amber-900">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSignout} className="text-white bg-red-600 hover:bg-red-800">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


      </SidebarContent>
    </Sidebar>
  )
}
