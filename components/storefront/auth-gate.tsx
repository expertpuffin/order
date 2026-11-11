"use client"

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { AuthDialog } from "@/components/auth/auth-dialog"
import { ProductAddSheet } from "@/components/storefront/product-add-sheet"
import type { CatalogProduct } from "@/lib/api/catalog"
import { readAuthQuery, withoutAuthQuery, type AuthTab } from "@/lib/auth-gate-url"

type AuthGateContextValue = {
  isAuthenticated: boolean
  canOrder: boolean
  openAuthGate: (tab?: AuthTab) => void
  /** Signed out → sign in; business under review → its status; can't order → onboarding; else the quick-add sheet */
  requestAddToCart: (product: CatalogProduct) => void
  requestCheckout: () => void
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null)

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) throw new Error("useAuthGate must be used within AuthGateProvider")
  return ctx
}

/** What a visitor may do on the storefront, and the sign-in modal and quick-add sheet that follow from it. */
export function AuthGateProvider({
  children,
  isAuthenticated,
  canOrder,
  businessId,
  businessStatus,
}: {
  children: ReactNode
  isAuthenticated: boolean
  canOrder: boolean
  businessId: string | null
  businessStatus: string | null
}) {
  const router = useRouter()
  const [dialog, setDialog] = useState<{ open: boolean; tab: AuthTab; next: string }>({
    open: false,
    tab: "login",
    next: "/onboarding",
  })
  const [sheetProduct, setSheetProduct] = useState<CatalogProduct | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const openAuthGate = useCallback((tab: AuthTab = "login") => setDialog((d) => ({ ...d, open: true, tab })), [])
  const openFromQuery = useCallback((tab: AuthTab, next: string) => setDialog({ open: true, tab, next }), [])

  const clearAuthQuery = useCallback(() => {
    const url = new URL(window.location.href)
    if (!readAuthQuery(url.searchParams)) return
    router.replace(withoutAuthQuery(url), { scroll: false })
  }, [router])

  const requestAddToCart = useCallback(
    (product: CatalogProduct) => {
      if (!isAuthenticated || businessStatus === "pending") return openAuthGate()
      if (!canOrder || !businessId) return router.push("/onboarding")
      setSheetProduct(product)
      setSheetOpen(true)
    },
    [isAuthenticated, businessStatus, canOrder, businessId, openAuthGate, router]
  )

  const requestCheckout = useCallback(() => {
    if (!isAuthenticated) return openAuthGate()
    router.push(canOrder ? "/cart" : "/onboarding")
  }, [isAuthenticated, canOrder, openAuthGate, router])

  const value = useMemo(
    () => ({ isAuthenticated, canOrder, openAuthGate, requestAddToCart, requestCheckout }),
    [isAuthenticated, canOrder, openAuthGate, requestAddToCart, requestCheckout]
  )

  return (
    <AuthGateContext.Provider value={value}>
      <Suspense fallback={null}>
        <AuthQuerySync
          isAuthenticated={isAuthenticated}
          onOpen={openFromQuery}
          onAlreadySignedIn={clearAuthQuery}
        />
      </Suspense>
      {children}

      <AuthDialog
        open={dialog.open}
        onOpenChange={(open) => {
          setDialog((d) => ({ ...d, open }))
          if (!open) clearAuthQuery()
        }}
        tab={dialog.tab}
        onTabChange={(tab) => setDialog((d) => ({ ...d, tab }))}
        next={dialog.next}
        awaitingApproval={isAuthenticated && businessStatus === "pending"}
      />

      {sheetProduct && businessId && canOrder ? (
        <ProductAddSheet open={sheetOpen} onOpenChange={setSheetOpen} product={sheetProduct} businessId={businessId} />
      ) : null}
    </AuthGateContext.Provider>
  )
}

/** Opens the modal a link asks for (`?auth=login&next=…`); a signed-in visitor just loses the parameters. */
function AuthQuerySync({
  isAuthenticated,
  onOpen,
  onAlreadySignedIn,
}: {
  isAuthenticated: boolean
  onOpen: (tab: AuthTab, next: string) => void
  onAlreadySignedIn: () => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const query = readAuthQuery(searchParams)
    if (!query) return
    if (isAuthenticated && query.tab === "login") onAlreadySignedIn()
    else onOpen(query.tab, query.next)
  }, [searchParams, isAuthenticated, onOpen, onAlreadySignedIn])
  return null
}
