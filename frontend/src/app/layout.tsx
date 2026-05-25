"use client";
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { Auth0Provider } from "@auth0/nextjs-auth0";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();


  const infoPages = ["/about", "/help", "/privacy", "/accessibility"];
  const isInfoPage = infoPages.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <Auth0Provider>
          {!isInfoPage && <Navbar />}
          <main>
            {children}
          </main>
        </Auth0Provider>
      </body>
    </html>
  );
}