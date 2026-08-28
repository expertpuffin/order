import { redirect } from "next/navigation"
import Link from "next/link"

import { getSessionUser } from "@/lib/api/auth"
import { getMyBusinessesSafe } from "@/lib/onboarding-routing"
import { getTranslator } from "@/lib/i18n"

export default async function PendingOnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/onboarding/pending")

  const businesses = await getMyBusinessesSafe()
  const pending = businesses.find((b) => b.status === "pending")
  const approved = businesses.find((b) => b.status === "approved")
  if (approved) redirect("/")
  if (!pending && businesses.length === 0) redirect("/onboarding/business")

  const { t } = await getTranslator()
  const name =
    pending?.tradingName || pending?.businessName || t("common.restoloop")

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10 text-center">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-primary">
          {t("status.pending")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">
          {t("storefront.pendingTitle")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("storefront.pendingBody")}
        </p>
        <p className="mt-4 text-sm font-medium">{name}</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          {t("storefront.keepBrowsing")}
        </Link>
      </div>
    </div>
  )
}
