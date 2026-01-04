"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Resolver, Controller } from "react-hook-form"
import Link from "next/link"
import { useDebounceValue } from "usehooks-ts"
import { toast } from "sonner"
import { signupSchema } from "../../schemas/auth/signUp.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "../../types/ApiResponse"
import { Field, FieldError, FieldGroup, FieldLabel, FieldContent } from "../ui/field"
import { Input } from "../ui/input"
import { Spinner } from "../ui/spinner"
import { Button } from "../ui/button"
import { signinSchema } from "@/schemas/auth/signIn.schema"
import { signIn } from "next-auth/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"




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
            router.push("/profile")
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-[#BBC7A4] py-16">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f2430]">Welcome to ReviewMe</h1>
                <p className="mt-4 text-md text-[#415a57]">To continue, fill out your personal info</p>
            </header>
            <div className="w-full max-w-lg bg-[#F2F5EA] border-2 border-black rounded-2xl shadow-md p-8">
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
                                            className="pr-12 border border-[#cfe8e1] focus:border-[#2f6b61]"
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
                                                <DropdownMenuItem onClick={() => setLoginType("email")}>
                                                    Email
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setLoginType("username")}>
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
                                    <FieldLabel htmlFor={field.name} className="sr-only">Password</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id={field.name}
                                            type="password"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Password"
                                            className="border border-[#cfe8e1] focus:border-[#2f6b61] rounded-md px-4 py-3 placeholder:text-[#9bbdb6]"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </FieldContent>
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="mt-4">
                        <Button
                            aria-label="submit"
                            disabled={isSubmitting}
                            className="w-md rounded-md bg-[#44786f] hover:bg-[#315951] text-white font-semibold py-3 border-2 disabled:opacity-60"
                        >
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </Button>
                    </div>

                    <div className="mt-4 mb-4">
                        <p className="text-center">or</p>
                    </div>

                    <div className="mt-4">
                        <Button
                            aria-label="submit"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full bg-white border border-gray-600 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition text-black"
                        >
                            Continue with Google
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-[#375b57]">New to ReviewMe? </span>
                        <Link href="/sign-up" className="text-[#6aa05f] font-medium">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

