import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getTranslator } from "@/lib/i18n"

export default async function HelpPage() {
  const { t } = await getTranslator()

  return (
    <>
      <PageHeader
        title={t("storefront.menuHelp")}
        description={t("storefront.helpDescription")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t("storefront.helpTitle")}</CardTitle>
          <CardDescription>{t("storefront.helpSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{t("storefront.helpBody")}</p>
          <Button nativeButton={false} render={<Link href="/" />}>
            {t("storefront.keepBrowsing")}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
