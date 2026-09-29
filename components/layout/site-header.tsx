"use client"

import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { useT } from "@/components/i18n/i18n-provider"
import { translateNavTitle } from "@/lib/i18n/nav-label"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { mainNav } from "@/lib/navigation"

function getPageTitle(pathname: string, t: (key: string) => string) {
  if (/^\/orders\/[^/]+$/.test(pathname)) return t("header.orderDetail")
  const match = mainNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  return match
    ? translateNavTitle(t, match.href, match.title)
    : t("nav.dashboard")
}

export function SiteHeader() {
  const pathname = usePathname()
  const t = useT()
  const title = getPageTitle(pathname, t)

  return (
    <header
      data-tour="tour-header"
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              {t("common.orderia")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium tracking-tight">
              {title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <LocaleSwitcher />
    </header>
  )
}
