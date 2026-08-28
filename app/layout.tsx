import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/components/i18n/i18n-provider"
import { getLocale, getMessages } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Restoloop Orders",
    template: "%s · Restoloop Orders",
  },
  description:
    "Restoloop orders panel for the platform-wide order feed and fulfilment status.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = getMessages(locale)

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider locale={locale} messages={messages}>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
