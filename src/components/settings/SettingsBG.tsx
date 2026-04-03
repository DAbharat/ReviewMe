"use client"
import React from 'react'
import { Separator } from '../ui/separator'

export default function SettingsBG() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2430] mb-2 mt-1 sm:mt-2">
        Settings
      </h1>
      <Separator className="w-full bg-black" />
    </div>
  )
}