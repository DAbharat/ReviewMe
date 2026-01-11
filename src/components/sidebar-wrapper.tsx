"use client"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-siderbar"

export default function SidebarWrapper() {
  const pathname = usePathname() ?? ""
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null
  }
  return <AppSidebar />
}
