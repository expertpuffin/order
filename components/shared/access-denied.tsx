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

export function AccessDenied({
  description = "Your staff role does not include this section.",
}: {
  description?: string
}) {
  return (
    <>
      <PageHeader title="Access denied" description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Insufficient permissions</CardTitle>
          <CardDescription>
            Ask a master or People Admin to update your staff role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
          >
            Back to home
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
