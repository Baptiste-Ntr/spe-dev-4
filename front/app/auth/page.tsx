'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeOff } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Eye } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { fetcher } from "@/lib/fetcher"
import { toast } from "sonner"

export default function AuthPage() {

    const { register, handleSubmit } = useForm<{ email: string, password: string, confirmPassword?: string }>()

    const [isRegister, setIsRegister] = useState(false)

    const [showPassword, setShowPassword] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (data: { email: string, password: string, confirmPassword?: string }) => {
        console.log(data)
        try {
            setIsLoading(true)
            const res = await fetcher(`/api/auth/${isRegister ? "register" : "login"}`, {
                method: "POST",
                body: JSON.stringify({ email: data.email, password: data.password }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            console.log(res)
            toast.success(`Successfully ${isRegister ? "registered" : "logged in"}`)
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="flex flex-col gap-8 items-center justify-center h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold text-center">DocCollab</h1>
                <p className="text-sm text-muted-foreground text-center">Collaborate on documents in real time</p>
            </div>
            <div className="flex flex-col gap-4 w-96 bg-white rounded-lg p-4 border-gray-300 border">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 space-y-4">
                    <div className="space-y-2 w-full">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            {...register("email")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="........"
                                {...register("password")}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                        </div>
                    </div>
                    {isRegister && <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="........"
                                {...register("confirmPassword")}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>}
                    <Button type="submit" disabled={isLoading}>{isRegister ? "Register" : "Login"}</Button>
                </form>
                <Button variant="link" onClick={() => setIsRegister(!isRegister)}>{isRegister ? "Login" : "Register"}</Button>
            </div>
        </div>
    )
}
