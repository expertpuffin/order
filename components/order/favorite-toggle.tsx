"use client"

import { useState, useTransition } from "react"
import { Star } from "lucide-react"

import { toggleFavoriteAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FavoriteToggleProps = {
  businessId: string
  productId: string
  favorited: boolean
  favoriteItemId?: string
}

export function FavoriteToggle({
  businessId,
  productId,
  favorited,
  favoriteItemId,
}: FavoriteToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState(favorited)

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!favorited)
          const result = await toggleFavoriteAction(
            businessId,
            productId,
            favorited,
            favoriteItemId
          )
          if (result && "favorited" in result) setOptimistic(result.favorited)
          notifyActionResult(result, favorited ? "Removed" : "Favourited")
        })
      }
    >
      <Star
        className={cn(
          optimistic ? "fill-orange-500 text-orange-500" : "text-muted-foreground"
        )}
      />
    </Button>
  )
}
