import Image from "next/image"
import Link from "next/link"

import { getTranslator } from "@/lib/i18n"

type OnboardingShellProps = {
  title: string
  subtitle?: string
  stepLabel?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export async function OnboardingShell({
  title,
  subtitle,
  stepLabel,
  children,
  footer,
}: OnboardingShellProps) {
  const { t } = await getTranslator()

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <Image
          src="/icon.png"
          alt=""
          width={28}
          height={28}
          className="size-7 object-contain"
        />
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {stepLabel || t("onboarding.setupLabel")}
          </p>
          <p className="text-sm font-semibold tracking-tight text-[var(--brand-navy)]">
            {t("common.restoloop")}
          </p>
        </div>
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-[var(--brand-navy)]">
        {title}
      </h1>
      <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
        {subtitle || t("onboarding.setupHint")}
      </p>
      {children}
      {footer ?? (
        <p className="mt-4 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-[var(--brand-navy)] underline-offset-4 hover:underline"
          >
            {t("storefront.keepBrowsing")}
          </Link>
        </p>
      )}
    </div>
  )
}
