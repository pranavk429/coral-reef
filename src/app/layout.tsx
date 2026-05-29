import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Audit Weaver — Compliance Audit Agent",
  description: "Multi-agent compliance auditing powered by Coral",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased h-screen flex overflow-hidden text-slate-900 bg-[#F8F9FA]">
        {children}
      </body>
    </html>
  )
}
