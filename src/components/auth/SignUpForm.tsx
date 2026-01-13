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
import { HoverCard, HoverCardTrigger } from "../ui/hover-card"


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
        <div className="min-h-screen flex flex-col items-center justify-start bg-[#EFE9D5] py-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl sm:text-4xl font-extrabold text-[#0f2430]">Welcome to ReviewMe</h1>
                <p className="mt-4 text-md text-gray-500 font-semibold">To continue, fill out your personal info</p>
            </header>

            <div className="w-full max-w-lg bg-white border border-black border-b-2 rounded-2xl shadow-md p-6">
                <h2 className="text-3xl font-bold text-[#0f2430] mb-4 text-center">Create your account</h2>
                <p className="text-center text-sm text-gray-500 mb-6">Choose a username and enter your email and password.</p>
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
                                            placeholder="Username" 
                                            className="border border-black border-b-2 placeholder:text-gray-400 font-semibold"
                                            />
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
                                            className="border-black border-b-2 font-semibold rounded-md px-4 py-3 placeholder:text-gray-400"
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
                                            className="border border-black border-b-2 font-semibold rounded-md px-4 py-3 placeholder:text-gray-400"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </FieldContent>
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="mt-3">
                        <p className="text-sm text-black mb-3 opacity-40 ml-1">Password must be at least 6 characters.</p>
                        <Button
                            aria-label="submit"
                            disabled={isSubmitting || isUsernameValid}
                            className="w-full rounded-md bg-white hover:bg-gray-200 sm:w-auto text-black font-semibold py-3 border border-black border-b-2 disabled:opacity-60 mt-3"
                        >
                            {isSubmitting ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400 font-semibold ml-2">Already have an account? </span>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Button variant="link" className="bg-white mr-2">
    <Link href="/sign-in" className="text-black font-medium mr-2">Sign in</Link>
</Button>
                            </HoverCardTrigger>

                        </HoverCard>
                    </div>
                </form>
            </div>
        </div>
    )
}

