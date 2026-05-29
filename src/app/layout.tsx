import { Inter } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Audit Weaver — Compliance Audit Agent",
  description: "Multi-agent compliance auditing powered by Coral",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased h-screen flex overflow-hidden text-slate-900 bg-[#F8F9FA]">
        {children}
      </body>
    </html>
  )
}
