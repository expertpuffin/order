"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"

import {
  loginAction,
  registerAction,
} from "@/lib/actions"
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
      {children}

      <Dialog
        open={gate.open}
        onOpenChange={(open) => setGate((g) => ({ ...g, open }))}
      >
        <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>
              {pendingBlocked
                ? t("storefront.pendingTitle")
                : gate.tab === "login"
                  ? t("auth.signIn")
                  : t("auth.signUp")}
            </DialogTitle>
            <DialogDescription>
              {pendingBlocked
                ? t("storefront.pendingBody")
                : t("storefront.authGateHint")}
            </DialogDescription>
          </DialogHeader>

          {pendingBlocked ? (
            <div className="space-y-3 p-5">
              <Button className="w-full" onClick={() => router.push("/onboarding/pending")}>
                {t("storefront.viewApplication")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setGate((g) => ({ ...g, open: false }))}
              >
                {t("storefront.keepBrowsing")}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 border-b">
                <button
                  type="button"
                  className={`py-2.5 text-sm font-medium ${
                    gate.tab === "login"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setGate((g) => ({ ...g, tab: "login" }))}
                >
                  {t("auth.signIn")}
                </button>
                <button
                  type="button"
                  className={`py-2.5 text-sm font-medium ${
                    gate.tab === "register"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setGate((g) => ({ ...g, tab: "register" }))}
                >
                  {t("auth.signUp")}
                </button>
              </div>
              <div className="p-5">
                {gate.tab === "login" ? (
                  <LoginGateForm next="/" />
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

function LoginGateForm({ next }: { next: string }) {
  const t = useT()
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      {state && "error" in state && state.error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="gate-email">{t("common.email")}</Label>
        <Input id="gate-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gate-password">{t("common.password")}</Label>
        <Input
          id="gate-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  )
}

function RegisterGateForm() {
  const t = useT()
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="space-y-3">
      {state && "error" in state && state.error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">{t("auth.firstName")}</Label>
          <Input id="firstName" name="firstName" required autoComplete="given-name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">{t("auth.lastName")}</Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-email">{t("common.email")}</Label>
        <Input id="reg-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">{t("auth.phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+44…"
          autoComplete="tel"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password">{t("common.password")}</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="receiveAnnouncements"
          value="off"
          className="mt-0.5"
        />
        {t("auth.optOutAnnouncements")}
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("auth.signingUp") : t("auth.signUp")}
      </Button>
    </form>
  )
}
