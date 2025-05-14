import { Navbar } from "@/components/Header/NavBar";

export default function WithNavbarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar /> 
            {children}
        </>
    );
} 