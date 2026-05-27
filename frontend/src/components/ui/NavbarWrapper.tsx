"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";

const HIDDEN_ON = [
    "/about",
    "/help",
    "/privacy",
    "/accessibility",
    "/login",
    "/onboarding",
];

export default function NavbarWrapper() {
    const pathname = usePathname();
    const hide = HIDDEN_ON.some(page => pathname.startsWith(page));
    if (hide) return null;
    return <Navbar />;
}