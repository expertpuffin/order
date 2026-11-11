/** A selectable chip or tile (fulfilment, day, slot, packaging, status tab): navy when chosen. */
export function choiceClass(selected: boolean) {
  return selected
    ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
    : "border-[var(--border-subtle)] bg-white text-[var(--brand-navy)] hover:bg-muted/40"
}
