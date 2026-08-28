"use client"

import { useT } from "@/components/i18n/i18n-provider"
import { translateGroupLabel, translateNavTitle } from "@/lib/i18n/nav-label"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  LogOut,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { mainNavGroups } from "@/lib/navigation"
import { hasTeamPermission } from "@/lib/permissions"
import { resolveTourTargetId } from "@/lib/product-tour"
import type { TeamPermission, User } from "@/lib/types"
import { cn } from "@/lib/utils"

type BusinessOption = {
  id: string
  tradingName: string
  status: string
}

type AppSidebarProps = {
  user: User
  businesses: BusinessOption[]
  activeBusinessId: string
  permissions: TeamPermission[]
  panelLabel: string
  cta?: { label: string; href: string }
  switchAction: (businessId: string) => Promise<void>
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({
  user,
  businesses,
  activeBusinessId,
  permissions,
  panelLabel,
  cta,
  switchAction,
}: AppSidebarProps) {
  const pathname = usePathname()
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId) ?? businesses[0]

  const groups = useMemo(
    () =>
      mainNavGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            hasTeamPermission(permissions, item.permission)
          ),
        }))
        .filter((group) => group.items.length > 0),
    [permissions]
  )

  const switchTo = (businessId: string) => {
    if (businessId === activeBusinessId) return
    startTransition(async () => {
      try {
        await switchAction(businessId)
      } finally {
        router.push("/dashboard")
        router.refresh()
      }
    })
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80">
      <SidebarHeader className="items-center gap-0 border-b border-sidebar-border/70 px-2 py-3 group-data-[collapsible=icon]:px-1.5">
        <Link
          href="/dashboard"
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-1 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Image
            src="/icon.png"
            alt="Restoloop"
            width={44}
            height={44}
            className="size-11 shrink-0 object-contain group-data-[collapsible=icon]:size-9"
            priority
          />
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Restoloop
          </span>
          <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600 group-data-[collapsible=icon]:hidden dark:text-orange-400">
            {panelLabel}
          </span>
        </Link>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="w-full gap-2 rounded-xl data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">
                    {activeBusiness?.tradingName ?? "No business"}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {activeBusiness?.status ?? ""}
                  </span>
                </div>
                <ChevronsUpDown className="size-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-xl"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Businesses
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  {businesses.map((business) => (
                    <DropdownMenuItem
                      key={business.id}
                      onClick={() => switchTo(business.id)}
                      disabled={pending}
                      className="gap-2"
                    >
                      <Check
                        className={cn(
                          "size-4",
                          business.id === activeBusinessId
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="truncate">{business.tradingName}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {cta ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<a href={cta.href} target="_blank" rel="noreferrer" />}
                tooltip={cta.label}
                className="mt-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground"
              >
                <ExternalLink />
                <span>{cta.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-1 py-2">
        {groups.map((group, groupIndex) => (
          <div key={group.id}>
            {groupIndex > 0 ? (
              <div className="mx-2 my-1.5 h-px bg-sidebar-border/60 opacity-60" />
            ) : null}
            <SidebarGroup className="py-1.5">
              <SidebarGroupLabel className="mb-1 h-7 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/45">
                {translateGroupLabel(t, group.id, group.label)}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const active = isNavActive(pathname, item.href)
                    const tourId = resolveTourTargetId(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={translateNavTitle(t, item.href, item.title)}
                          render={
                            <Link
                              href={item.href}
                              data-tour={tourId}
                              data-tour-icon={tourId}
                            />
                          }
                          className={cn(
                            "relative h-9 rounded-lg px-2.5 transition-colors",
                            active &&
                              "bg-orange-500/10 font-semibold text-orange-600 hover:bg-orange-500/15 hover:text-orange-600 data-active:text-orange-600 data-active:hover:text-orange-600 before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[#F58220] dark:text-orange-400 dark:data-active:text-orange-400 dark:hover:text-orange-400"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-4 shrink-0",
                              active
                                ? "!text-orange-600 dark:!text-orange-400"
                                : "text-sidebar-foreground/70"
                            )}
                          />
                          <span
                            className={cn(
                              active && "!text-orange-600 dark:!text-orange-400"
                            )}
                          >
                            {translateNavTitle(t, item.href, item.title)}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="rounded-xl data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg ring-1 ring-border/60">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-orange-500/10 text-xs font-semibold text-orange-700 dark:text-orange-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-xl"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-orange-500/10 text-orange-700">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      void (async () => {
                        try {
                          await fetch("/api/auth/logout", {
                            method: "POST",
                            credentials: "same-origin",
                          })
                        } catch {
                          /* ignore */
                        }
                        window.location.href = "/login"
                      })()
                    }}
                  >
                    <LogOut />
                    {t("common.logOut")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
