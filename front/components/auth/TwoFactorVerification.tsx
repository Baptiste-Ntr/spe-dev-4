import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { fetcher } from "@/lib/fetcher"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp"

export const TwoFactorVerification = () => {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleVerify = async () => {
        if (code.length !== 6) {
            toast.error("Le code doit faire 6 chiffres")
            return
        }

        try {
            setIsLoading(true)
            const res = await fetcher("/api/auth/2fa/verify", {
                method: "POST",
                body: JSON.stringify({ code }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            console.log(res)
            toast.success("Connexion réussie")
            router.push("/dashboard")
        } catch (error) {
            let message = "Code invalide";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(message);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4 w-96 bg-white rounded-lg p-4 border-gray-300 border">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-center">Vérification 2FA</h2>
                <p className="text-sm text-muted-foreground text-center">Entrez le code de votre application d&apos;authentification</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2 flex flex-col items-center gap-4">
                    <Label htmlFor="code">Code de vérification</Label>
                    <InputOTP maxLength={6} value={code} onChange={setCode} className="w-full">
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <Button
                    onClick={handleVerify}
                    disabled={isLoading || code.length !== 6}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Vérification...
                        </>
                    ) : (
                        "Vérifier"
                    )}
                </Button>
            </div>
        </div>
    )
} 