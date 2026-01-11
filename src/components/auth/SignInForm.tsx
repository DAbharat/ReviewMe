"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import Link from "next/link"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Field, FieldError, FieldGroup, FieldLabel, FieldContent } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { signinSchema } from "@/schemas/auth/signIn.schema"
import { signIn } from "next-auth/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"



export default function SignInForm() {

    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loginType, setLoginType] = useState<"email" | "username">("email")

    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    }
    )

    const onSubmit = async (data: z.infer<typeof signinSchema>) => {
        const result = await signIn("credentials", {
            redirect: false,
            username: data.username,
            email: data.email,
            password: data.password
        })

        if (!result) {
            toast.error("Something went wrong. Please try again.")
            return
        }

        if (result?.error) {
            toast.error("Invalid email or password")
        }

        if (result?.ok) {
            // fetch session to get the canonical username (handles email sign-in)
            try {
                const sess = await fetch('/api/auth/session').then(r => r.json())
                const slug = sess?.user?.username || sess?.user?._id || data.username || ''
                if (slug) router.push(`/profile/${slug}`)
                else router.push('/')
            } catch (e) {
                router.push('/')
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-[#EFE9D5] py-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f2430]">Welcome to ReviewMe</h1>
                <p className="mt-4 text-md text-gray-500 font-semibold">To continue, fill out your personal info</p>
            </header>
            <div className="w-full max-w-lg bg-white border-2 border-black border-b-3 rounded-2xl shadow-md p-6">
                <h2 className="text-3xl font-bold text-[#0f2430] mb-4 text-center">Sign in to your account</h2>
                <p className="text-center text-sm text-[#6b8b84] mb-6">Enter your credentials or sign in via Google</p>
                <form onSubmit={form.handleSubmit(onSubmit)}>

                    <FieldGroup>

                        <Controller
                            control={form.control}
                            name={loginType}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldContent className="relative">
                                        <Input
                                            {...field}
                                            type={loginType === "email" ? "email" : "text"}
                                            placeholder={loginType === "email" ? "Email" : "Username"}
                                            className="pr-12 border font-semibold placeholder:text-gray-400 border-black border-b-2"
                                        />

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#415a57] hover:opacity-80"
                                                >
                                                    ▾
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="font-semibold" onClick={() => setLoginType("email")}>
                                                    Email
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="font-semibold" onClick={() => setLoginType("username")}>
                                                    Username
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="sr-only ">Password</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id={field.name}
                                            type="password"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Password"
                                            className="border border-black border-b-2 rounded-md px-4 py-3 font-semibold placeholder:text-gray-400"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </FieldContent>
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="mt-8">
                        <Button
                            aria-label="submit"
                            disabled={isSubmitting}
                            className="w-md rounded-md bg-white hover:bg-gray-200 text-black font-semibold py-3 border border-black border-b-2 disabled:opacity-60"
                        >
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </Button>
                    </div>

                    <div className="mt-2 mb-2">
                        <p className="text-center">or</p>
                    </div>

                    <div className="mt-4">
                        <Button
                            aria-label="submit"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full bg-white hover:bg-gray-200 border border-black border-b-2 rounded-lg py-2 flex items-center justify-center gap-2transition text-black"
                        >
                            Continue with Google
                        </Button>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-400 font-semibold ml-2">New to ReviewMe? </span><HoverCard>
                            <HoverCardTrigger asChild>
                                <Button variant="link" className="bg-white mr-2">
    <Link href="/sign-up" className="text-black font-medium mr-2">Sign up</Link>
</Button>
                            </HoverCardTrigger>

                        </HoverCard>
                        
                    </div>
                </form>
            </div>
        </div>
    )
}

