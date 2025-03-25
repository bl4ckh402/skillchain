"use client"

import { useEffect } from "react"

export default function LessonClient() {
  useEffect(() => {
    const sidebarToggle = document.getElementById("sidebar-toggle")
    const closeSidebar = document.getElementById("close-sidebar")
    const mobileSidebar = document.getElementById("mobile-sidebar")

    const handleToggleSidebar = () => {
      mobileSidebar?.classList.toggle("hidden")
    }

    sidebarToggle?.addEventListener("click", handleToggleSidebar)
    closeSidebar?.addEventListener("click", handleToggleSidebar)

    return () => {
      sidebarToggle?.removeEventListener("click", handleToggleSidebar)
      closeSidebar?.removeEventListener("click", handleToggleSidebar)
    }
  }, [])

  return null
}

