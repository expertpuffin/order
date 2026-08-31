import Link from "next/link"

import { PuffinIcon, PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { Button } from "@/components/ui/button"
import { getTranslator } from "@/lib/i18n"

export default async function HelpPage() {
  const { t } = await getTranslator()

  return (
    <div className="space-y-5">
      <AccountPageHeader
        eyebrow={t("storefront.helpSectionLabel")}
        title={t("storefront.menuHelp")}
        description={t("storefront.helpDescription")}
      />

      <section className="rounded-[2px] border border-[var(--sidebar-border)] bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-4 border-b border-[var(--sidebar-border)] pb-4">
          <PuffinIcon
            name={PUFFIN_ICONS.help}
            className="size-16 shrink-0 text-[var(--brand-navy)]"
            label={t("storefront.helpTitle")}
          />
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("storefront.helpSectionLabel")}
            </p>
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
              {t("storefront.helpTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("storefront.helpSubtitle")}
            </p>
          </div>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {t("storefront.helpBodyBefore")}
          <a
            href={`mailto:${t("storefront.supportEmail")}`}
            className="font-medium text-[var(--brand-orange)] underline-offset-4 hover:text-[var(--brand-orange)] hover:underline"
          >
            {t("storefront.supportEmail")}
          </a>
          {t("storefront.helpBodyAfter")}
        </p>
        <Button
          className="h-10 rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
          nativeButton={false}
          render={<Link href="/" />}
        >
          {t("storefront.keepBrowsing")}
        </Button>
      </section>
    </div>
  )
}
