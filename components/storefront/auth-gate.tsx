"use client"

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"

import {
  loginAction,
  registerAction,
} from "@/lib/actions"
import { PuffinIcon, PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CatalogProduct } from "@/lib/api/catalog"
import { ProductAddSheet } from "@/components/storefront/product-add-sheet"

export type AuthGateIntent =
  | "browse"
  | "add-to-cart"
  | "checkout"
  | "address"
  | "favourite"

type AuthGateState = {
  open: boolean
  tab: "login" | "register"
  intent: AuthGateIntent
  product: CatalogProduct | null
}

type AuthGateContextValue = {
  isAuthenticated: boolean
  canOrder: boolean
  businessId: string | null
  businessStatus: string | null
  openAuthGate: (opts?: {
    intent?: AuthGateIntent
    product?: CatalogProduct | null
    tab?: "login" | "register"
  }) => void
  openProductSheet: (product: CatalogProduct) => void
  requestAddToCart: (product: CatalogProduct) => void
  requestCheckout: () => void
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null)

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) throw new Error("useAuthGate must be used within AuthGateProvider")
  return ctx
}

type AuthGateProviderProps = {
  children: ReactNode
  isAuthenticated: boolean
  canOrder: boolean
  businessId: string | null
  businessStatus: string | null
}

export function AuthGateProvider({
  children,
  isAuthenticated,
  canOrder,
  businessId,
  businessStatus,
}: AuthGateProviderProps) {
  const router = useRouter()
  const t = useT()
  const [gate, setGate] = useState<AuthGateState>({
    open: false,
    tab: "login",
    intent: "browse",
    product: null,
  })
  const [productSheetOpen, setProductSheetOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState<CatalogProduct | null>(null)
  const [loginNext, setLoginNext] = useState("/onboarding")

  const openAuthGate = useCallback(
    (opts?: {
      intent?: AuthGateIntent
      product?: CatalogProduct | null
      tab?: "login" | "register"
    }) => {
      setGate({
        open: true,
        tab: opts?.tab ?? "login",
        intent: opts?.intent ?? "browse",
        product: opts?.product ?? null,
      })
    },
    []
  )

  const clearAuthQuery = useCallback(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    if (!url.searchParams.has("auth") && !url.searchParams.has("next")) return
    url.searchParams.delete("auth")
    url.searchParams.delete("next")
    const qs = url.searchParams.toString()
    router.replace(qs ? `${url.pathname}?${qs}` : url.pathname, { scroll: false })
  }, [router])

  const handleAuthQueryOpen = useCallback(
    (tab: "login" | "register", next: string) => {
      setLoginNext(next)
      setGate({
        open: true,
        tab,
        intent: "browse",
        product: null,
      })
    },
    []
  )

  const openProductSheet = useCallback((product: CatalogProduct) => {
    setActiveProduct(product)
    setProductSheetOpen(true)
  }, [])

  const requestAddToCart = useCallback(
    (product: CatalogProduct) => {
      if (!isAuthenticated) {
        openAuthGate({ intent: "add-to-cart", product, tab: "login" })
        return
      }
      if (businessStatus === "pending") {
        openAuthGate({ intent: "add-to-cart", product })
        return
      }
      if (!canOrder || !businessId) {
        router.push("/onboarding")
        return
      }
      openProductSheet(product)
    },
    [
      isAuthenticated,
      canOrder,
      businessId,
      businessStatus,
      openAuthGate,
      openProductSheet,
      router,
    ]
  )

  const requestCheckout = useCallback(() => {
    if (!isAuthenticated) {
      openAuthGate({ intent: "checkout", tab: "login" })
      return
    }
    if (!canOrder) {
      router.push("/onboarding")
      return
    }
    router.push("/cart")
  }, [isAuthenticated, canOrder, openAuthGate, router])

  const value = useMemo(
    () => ({
      isAuthenticated,
      canOrder,
      businessId,
      businessStatus,
      openAuthGate,
      openProductSheet,
      requestAddToCart,
      requestCheckout,
    }),
    [
      isAuthenticated,
      canOrder,
      businessId,
      businessStatus,
      openAuthGate,
      openProductSheet,
      requestAddToCart,
      requestCheckout,
    ]
  )

  const pendingBlocked = isAuthenticated && businessStatus === "pending"

  return (
    <AuthGateContext.Provider value={value}>
      <Suspense fallback={null}>
        <AuthQuerySync
          isAuthenticated={isAuthenticated}
          onOpen={handleAuthQueryOpen}
          onClearAuthenticatedLogin={clearAuthQuery}
        />
      </Suspense>
      {children}

      <Dialog
        open={gate.open}
        onOpenChange={(open) => {
          setGate((g) => ({ ...g, open }))
          if (!open) clearAuthQuery()
        }}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] p-0 ring-0 sm:max-w-md">
          <DialogHeader className="space-y-1 border-b border-[var(--sidebar-border)] px-5 py-4 text-left">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/icon.png"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 object-contain"
                />
                <span className="text-sm font-semibold tracking-tight text-[var(--brand-navy)]">
                  {t("common.restoloop")}
                </span>
              </div>
              <PuffinIcon
                name={PUFFIN_ICONS.welcome}
                className="size-12 shrink-0 text-[var(--brand-navy)]"
              />
            </div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("auth.accountLabel")}
            </p>
            <DialogTitle className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
              {pendingBlocked
                ? t("storefront.pendingTitle")
                : gate.tab === "login"
                  ? t("auth.signIn")
                  : t("auth.signUp")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {pendingBlocked
                ? t("storefront.pendingBody")
                : t("storefront.authGateHint")}
            </DialogDescription>
          </DialogHeader>

          {pendingBlocked ? (
            <div className="space-y-2 p-5">
              <Button
                className="h-11 w-full rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
                onClick={() => router.push("/onboarding/pending")}
              >
                {t("storefront.viewApplication")}
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"
                onClick={() => setGate((g) => ({ ...g, open: false }))}
              >
                {t("storefront.keepBrowsing")}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 border-b border-[var(--sidebar-border)] bg-muted/20">
                <button
                  type="button"
                  className={
                    gate.tab === "login"
                      ? "bg-[var(--brand-navy)] py-2.5 text-sm font-medium text-white"
                      : "py-2.5 text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/60"
                  }
                  onClick={() => setGate((g) => ({ ...g, tab: "login" }))}
                >
                  {t("auth.signIn")}
                </button>
                <button
                  type="button"
                  className={
                    gate.tab === "register"
                      ? "bg-[var(--brand-navy)] py-2.5 text-sm font-medium text-white"
                      : "py-2.5 text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/60"
                  }
                  onClick={() => setGate((g) => ({ ...g, tab: "register" }))}
                >
                  {t("auth.signUp")}
                </button>
              </div>
              <div className="p-5">
                {gate.tab === "login" ? (
                  <LoginGateForm next={loginNext} />
                ) : (
                  <RegisterGateForm />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {activeProduct && businessId && canOrder ? (
        <ProductAddSheet
          open={productSheetOpen}
          onOpenChange={setProductSheetOpen}
          product={activeProduct}
          businessId={businessId}
        />
      ) : null}
    </AuthGateContext.Provider>
  )
}

function AuthQuerySync({
  isAuthenticated,
  onOpen,
  onClearAuthenticatedLogin,
}: {
  isAuthenticated: boolean
  onOpen: (tab: "login" | "register", next: string) => void
  onClearAuthenticatedLogin: () => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const auth = searchParams.get("auth")
    if (auth !== "login" && auth !== "register") return
    const rawNext = searchParams.get("next")
    const next =
      rawNext?.startsWith("/") && !rawNext.startsWith("//")
        ? rawNext
        : "/onboarding"
    if (isAuthenticated && auth === "login") {
      onClearAuthenticatedLogin()
      return
    }
    onOpen(auth, next)
  }, [searchParams, isAuthenticated, onOpen, onClearAuthenticatedLogin])

  return null
}

const gateField =
  "h-10 rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
const gateLabel =
  "text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
const gateSubmit =
  "h-11 w-full rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"

function LoginGateForm({ next }: { next: string }) {
  const t = useT()
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="hidden" name="next" value={next} />
      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="gate-email" className={gateLabel}>
          {t("common.email")}
        </Label>
        <Input
          id="gate-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={gateField}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gate-password" className={gateLabel}>
          {t("common.password")}
        </Label>
        <Input
          id="gate-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={gateField}
        />
      </div>
      <Button type="submit" className={gateSubmit} disabled={pending}>
        {pending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  )
}

function RegisterGateForm() {
  const t = useT()
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="space-y-3.5">
      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className={gateLabel}>
            {t("auth.firstName")}
          </Label>
          <Input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className={gateField}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className={gateLabel}>
            {t("auth.lastName")}
          </Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            className={gateField}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-email" className={gateLabel}>
          {t("common.email")}
        </Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={gateField}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone" className={gateLabel}>
          {t("auth.phone")}
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+44…"
          autoComplete="tel"
          className={gateField}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className={gateLabel}>
          {t("common.password")}
        </Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={gateField}
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="receiveAnnouncements"
          value="off"
          className="mt-0.5 size-3.5 rounded-[2px] border-[var(--sidebar-border)] accent-[var(--brand-navy)]"
        />
        {t("auth.optOutAnnouncements")}
      </label>
      <Button type="submit" className={gateSubmit} disabled={pending}>
        {pending ? t("auth.signingUp") : t("auth.signUp")}
      </Button>
    </form>
  )
}
