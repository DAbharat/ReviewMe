import { Suspense } from "react"
import FeedClient from "@/components/feed/FeedClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-400">Loading feed…</div>}>
      <FeedClient />
    </Suspense>
  )
}
