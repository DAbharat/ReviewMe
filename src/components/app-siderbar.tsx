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




const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "User", url: "#", icon: User },
  { title: "Settings", url: "#", icon: Settings },
]

const helpActions = [
  { title: "Support", url: "#", icon: Aperture },
  { title: "Feedback", url: "#", icon: MessageSquareText },
]

export function AppSidebar() {

  const { data: session } = useSession()

  const handleSignout = async () => {
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
    <Sidebar collapsible="icon"  >
      <SidebarHeader />

      <SidebarContent >

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-black">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
                  <SidebarMenuButton asChild>
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
                  <SidebarMenuButton className="w-full flex items-center gap-3 rounded-md bg-gray-200 hover:bg-gray-300 px-3 py-2 text-black">
                    <User />
                    <span className="flex-1 text-left">Username</span>
                    <ChevronUp className="ml-2" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" sideOffset={8} className="w-48 rounded-lg bg-white p-2">
                  <DropdownMenuItem
                    onClick={handleProfile}
                    className="w-full px-3 py-2 text-sm cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignout}
                    className="w-full px-3 py-2 text-sm text-red-600 cursor-pointer focus:text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </SidebarContent>
    </Sidebar>
  )
}
