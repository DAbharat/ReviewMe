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


export default function SignUpForm() {

    const router = useRouter()

    const [usernameMessage, setUsernameMessage] = useState("")
    const [isUsernameValid, setIsUsernameValid] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })


    const username = form.watch("username")
    const [debouncedUsername] = useDebounceValue(username ?? "", 500)


    useEffect(() => {
        const checkUniqueUsername = async () => {
            if (debouncedUsername) {
                setIsUsernameValid(true)
                setUsernameMessage("")
                try {
                    const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${debouncedUsername}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
                } finally {
                    setIsUsernameValid(false)
                }
            }
        }
        checkUniqueUsername()
    }, [debouncedUsername])

    const onSubmit = async (data: z.infer<typeof signupSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/sign-up`, data)
            toast.success(response.data.message)
            router.push("/sign-in")
        } catch (error) {
            console.error("Sign up error:", error)
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Sign up failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-[#BBC7A4] py-16">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f2430]">Welcome to ReviewMe</h1>
                <p className="mt-4 text-md text-[#415a57]">To continue, fill out your personal info</p>
            </header>

            <div className="w-full max-w-lg bg-[#F2F5EA] border-2 border-black rounded-2xl shadow-md p-8">
                <h2 className="text-3xl font-bold text-[#0f2430] mb-4 text-center">Create your account</h2>
                <p className="text-center text-sm text-[#6b8b84] mb-6">Choose a username and enter your email and password.</p>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>

                        <Controller
                            control={form.control}
                            name="username"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="sr-only">Username</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Name" />
                                        {isUsernameValid && <Spinner />}
                                        <p className={`text-sm ml-1.5 ${usernameMessage === "Username is available" ? "text-green-600" : "text-red-600"}`}>{usernameMessage}</p>
                                        {/* {!isUsernameValid && usernameMessage && (
                                            <div className="ml-1 text-sm text-[#7b0b0b]">
                                                {usernameMessage}
                                            </div>
                                        )} */}
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="sr-only">Email</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id={field.name}
                                            type="email"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Email"
                                            className="border border-[#cfe8e1] focus:border-[#2f6b61] rounded-md px-4 py-3 placeholder:text-[#9bbdb6]"
                                        />
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
                        <p className="text-sm text-[#6b8b84] mb-3">Password must be at least 8 characters and contain uppercase, lowercase, and numbers</p>
                        <Button
                            aria-label="submit"
                            disabled={isSubmitting || isUsernameValid}
                            className="w-md rounded-md bg-[#44786f] hover:bg-[#315951] text-white font-semibold py-3 border-2 disabled:opacity-60"
                        >
                            {isSubmitting ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-[#375b57]">Already have an account? </span>
                        <Link href="/sign-in" className="text-[#6aa05f] font-medium">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

