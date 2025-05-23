'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeOff } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Eye } from "lucide-react"
import { useState,useContext } from "react"
import { useForm } from "react-hook-form"
import { fetcher } from "@/lib/fetcher"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TwoFactorVerification } from "@/components/auth/TwoFactorVerification"
import { AuthContext } from "@/context/AuthContext"



export default function AuthPage() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<{ email: string, password: string, confirmPassword?: string, firstName?: string, lastName?: string }>()
    const [isRegister, setIsRegister] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showTwoFactor, setShowTwoFactor] = useState(false)
    const router = useRouter()
    const { refreshUser } = useContext(AuthContext);


    const onSubmit = async (data: { email: string, password: string, confirmPassword?: string }) => {
        // Vérification du format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setError("email", { type: "manual", message: "Format d'email invalide" });
            toast.error("Format d'email invalide");
            return;
        }
        // Vérification de la correspondance des mots de passe en mode inscription
        if (isRegister && data.password !== data.confirmPassword) {
            setError("password", { type: "manual", message: "Les mots de passe ne correspondent pas" });
            setError("confirmPassword", { type: "manual", message: "Les mots de passe ne correspondent pas" });
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

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

            if (res.twoFactorEnabled) {
                setShowTwoFactor(true)
                toast.info("Veuillez entrer votre code 2FA")
            } else {
                toast.success(`Successfully ${isRegister ? "registered" : "logged in"}`)
                await refreshUser();
                router.push("/dashboard")
            }
        } catch (error) {
            let message = "Something went wrong";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(message);
        } finally {
            setIsLoading(false)
        }
    }

    if (showTwoFactor) {
        return (
            <div className="flex flex-col gap-8 items-center justify-center h-screen">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-center">DocCollab</h1>
                    <p className="text-sm text-muted-foreground text-center">Collaborate on documents in real time</p>
                </div>
                <TwoFactorVerification />
            </div>
        )
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
                            className={errors.email ? "border-red-500" : ""}
                        />
                    </div>
                    {isRegister && (
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register("firstName")} />
                        </div>
                    )}
                    {isRegister && (
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register("lastName")} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="........"
                                {...register("password")}
                                className={errors.password ? "border-red-500" : ""}
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
                                className={errors.confirmPassword ? "border-red-500" : ""}
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
