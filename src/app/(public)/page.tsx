"use client"
import Link from "next/link"
import { Button } from "../../components/ui/button"

export default function LandingPage() {
	return (
		<main className="min-h-screen bg-[#BBC7A4] flex flex-col items-center text-[#0f2430]">
			<header className="w-full max-w-5xl mt-12 px-6 text-center">
				<div className="flex flex-col items-center gap-6">
					

					<h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
						Welcome to <span className="text-[#9fd85a]">ReviewMe</span>
					</h1>

					<p className="max-w-2xl text-gray-600 text-lg">
						A community-driven platform to share opinions, reviews, and honest feedback.
					</p>

					<div className="mt-6">
						<Link href="/sign-up">
							<Button className="bg-[#cfff7a] border-2 border-black text-[#0f2430] px-6 py-3 rounded-full shadow-md" size="lg">
								Get Started
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<section className="w-full max-w-6xl mt-16 px-6 mb-20">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
					<article className="bg-white rounded-md border-2 border-black p-6 shadow-sm">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 bg-[#e8ffda] rounded-full flex items-center justify-center border border-black">
								📖
							</div>
							<div>
								<h3 className="font-semibold text-lg">Create & Share Posts</h3>
								<p className="text-gray-600 mt-2">Share your thoughts, reviews, and experiences with the community.</p>
							</div>
						</div>
					</article>

					<article className="bg-white rounded-md border-2 border-black p-6 shadow-sm">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 bg-[#e8ffda] rounded-full flex items-center justify-center border border-black">
								🧠
							</div>
							<div>
								<h3 className="font-semibold text-lg">Vote & Discuss</h3>
								<p className="text-gray-600 mt-2">Engage with the community by voting on posts and participating in discussions.</p>
							</div>
						</div>
					</article>
				</div>
			</section>
		</main>
	)
}
