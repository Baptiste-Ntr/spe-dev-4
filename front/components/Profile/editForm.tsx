import { useForm } from "react-hook-form"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { User } from "@/types/model"
import { fetcher } from "@/lib/fetcher"
import { toast } from "sonner"

export const EditForm = ({ defaultUserEmail, defaultUserFirstName, defaultUserLastName, userId }: { defaultUserEmail: string, defaultUserFirstName: string, defaultUserLastName: string, userId: string }) => {

    const { register, handleSubmit, setError, formState: { errors } } = useForm<User>()

    const onSubmit = async (data: User) => {
        try {
            const response = await fetcher(`/api/user/${userId}`, {
                method: "PATCH",
                body: JSON.stringify(data)
            })
            if (response) {
                toast.success("Utilisateur mis à jour avec succès")
            }
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
            if (error.message?.includes("email")) {
                setError("email", { 
                    type: "manual", 
                    message: "Cet email est déjà utilisé par un autre utilisateur" 
                });
            }
            toast.error(error.message || "Erreur lors de la mise à jour de l'utilisateur")
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* <Button>Edit Profile</Button> */}
                <span>Edit Profile</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input id="email" {...register("email")} className="col-span-3" defaultValue={defaultUserEmail} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                                First Name
                            </Label>
                            <Input id="firstName" {...register("firstName")} className="col-span-3" defaultValue={defaultUserFirstName} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                                Last Name
                            </Label>
                            <Input id="lastName" {...register("lastName")} className="col-span-3" defaultValue={defaultUserLastName} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}