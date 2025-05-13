import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AuthContext } from "@/context/AuthContext"
import { User as UserType } from "@/types/model"
import { fetcher } from "@/lib/fetcher"
import { Copy, Loader2 } from "lucide-react"
import Image from "next/image"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

export const TwoFactor = () => {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<"setup" | "verify">("setup")
    const [secretKey, setSecretKey] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState("")
    const [qrCode, setQrCode] = useState("")
    const [isFetchCodeLoading, setIsFetchCodeLoading] = useState(true)
    const router = useRouter()

    const { user } = useContext(AuthContext) as { user: UserType | null }

    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(user?.isTwoFactorEnabled || false)

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await fetcher("/api/2fa/generate-secret-code", {
                    method: "GET",
                })
                if (response) {
                    setQrCode(response.qrCode)
                    setSecretKey(response.secret.base32)
                }
            } catch (error) {
                console.error("Erreur lors de la génération du code QR:", error)
            } finally {
                setIsFetchCodeLoading(false)
            }
        }
        fetchQrCode()
    }, [])

    const handleEnable2FA = async () => {
        try {
            const response = await fetcher("/api/2fa/enable-2fa", {
                method: "POST",
                body: JSON.stringify({ secretKey, verificationCode, userId: user?.id }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response) {
                toast.success("Two-Factor Authentication enabled")
                setOpen(false)
                setIsTwoFactorEnabled(true)
                router.push("/dashboard")
            }
        } catch (error) {
            console.error("Erreur lors de l'activation du 2FA:", error)
        }
    }

    const handleDisable2FA = async () => {
        try {
            const response = await fetcher("/api/2fa/disable-2fa", {
                method: "POST",
                body: JSON.stringify({ userId: user?.id }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response) {
                toast.success("Two-Factor Authentication disabled")
                setIsTwoFactorEnabled(false)
                setOpen(false)
                router.push("/dashboard")
            }
        } catch (error) {
            console.error("Erreur lors de la désactivation du 2FA:", error)
        }
    }

    console.log(secretKey)

    const handleClose = () => {
        setOpen(false)
        setStep("setup")
    }

    const handleVerify = async () => {
        try {
            setIsVerifying(true)
            const response = await fetcher("/api/2fa/verify-secret-code", {
                method: "POST",
                body: JSON.stringify({ secretKey, verificationCode }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response) {
                handleEnable2FA()
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du code de vérification:", error)
            setError("Invalid verification code")
        } finally {
            setIsVerifying(false)
        }
    }

    if (isFetchCodeLoading) {
        return <Loader2 className="h-4 w-4 animate-spin" />
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* <Button>Edit Profile</Button> */}
                <span>Two-Factor Authentication</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {step === "setup" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                            <DialogDescription>
                                Enhance your account security by enabling two-factor authentication.
                            </DialogDescription>
                        </DialogHeader>
                        {isTwoFactorEnabled ? (
                            <div className="space-y-4 py-4">
                                <p>Two-Factor Authentication is already enabled</p>
                                <Button onClick={handleDisable2FA}>Disable Two-Factor Authentication</Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <h3 className="font-medium">1. Scan this QR code with your authenticator app</h3>
                                        <div className="flex justify-center rounded-lg border bg-muted/50 p-4">
                                            <Image
                                                src={qrCode}
                                                alt="QR Code for 2FA"
                                                width={200}
                                                height={200}
                                                className="h-48 w-48 rounded-md"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-medium">2. Or enter this code manually</h3>
                                        <div className="flex items-center space-x-2 rounded-md border bg-muted/50 p-2">
                                            <code className="flex-1 text-sm">{secretKey}</code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(secretKey)
                                                    toast.success("Secret key copied")
                                                }}
                                            >
                                                <Copy className="h-4 w-4" />
                                                <span className="sr-only">Copy secret key</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-medium">3. Enter the verification code from your app</h3>
                                        <div className="space-y-2 flex flex-col items-center gap-4">
                                            <Label htmlFor="verification-code">Verification Code</Label>
                                            <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode} className="w-full">
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
                                            {error && <p className="text-sm text-destructive">{error}</p>}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleVerify} disabled={verificationCode.length !== 6 || isVerifying}>
                                        {isVerifying ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify & Enable"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}