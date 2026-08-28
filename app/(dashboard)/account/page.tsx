import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { BusinessSwitcher } from "@/components/storefront/business-switcher"
import { StatusBadge } from "@/components/shared/status-badge"
import { getBusinessContext } from "@/lib/business-context"
import { getTranslator } from "@/lib/i18n"

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-[var(--brand-navy)]">
        {value?.trim() ? value : "—"}
      </span>
    </div>
  )
}

export default async function AccountPage() {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx) return <AccessDenied />

  const { user, businesses, active: business } = ctx

  if (!businesses.length) {
    redirect("/onboarding/business")
  }

  const address = [
    business.addressLine1,
    business.addressLine2,
    business.city,
    business.county,
    business.postcode,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-5">
      <AccountPageHeader
        title={t("account.title")}
        description={t("account.description")}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-[var(--brand-navy)]">
            {t("account.profileTitle")}
          </h2>
          <DetailRow label={t("account.name")} value={user.name} />
          <DetailRow label={t("account.email")} value={user.email} />
          <DetailRow
            label={t("account.phone")}
            value={user.phone ?? undefined}
          />
        </section>

        <section className="rounded-2xl border bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                {t("account.businessTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("account.businessHint")}
              </p>
            </div>
            <StatusBadge status={business.status} />
          </div>

          <BusinessSwitcher
            businesses={businesses.map((item) => ({
              id: item.id,
              tradingName: item.tradingName || item.businessName,
              status: item.status,
            }))}
            activeBusinessId={business.id}
          />

          <div className="mt-4">
            <DetailRow
              label={t("account.tradingName")}
              value={business.tradingName || business.businessName}
            />
            <DetailRow
              label={t("account.legalName")}
              value={business.businessName}
            />
            <DetailRow label={t("account.businessType")} value={business.businessType} />
            <DetailRow label={t("account.businessNumber")} value={business.businessNumber} />
            <DetailRow label={t("account.address")} value={address} />
            <DetailRow label={t("account.contact")} value={business.contactName} />
            <DetailRow label={t("account.contactPhone")} value={business.contactPhone} />
            <DetailRow
              label={t("account.hours")}
              value={
                business.openTime && business.closeTime
                  ? `${business.openTime} – ${business.closeTime}`
                  : undefined
              }
            />
            <DetailRow
              label={t("account.deliveryWindow")}
              value={business.deliveryTime ?? undefined}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
