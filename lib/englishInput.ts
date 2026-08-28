const FOLD: Record<string, string> = {
  ç: "c",
  Ç: "C",
  ğ: "g",
  Ğ: "G",
  ı: "i",
  İ: "I",
  ö: "o",
  Ö: "O",
  ş: "s",
  Ş: "S",
  ü: "u",
  Ü: "U",
  â: "a",
  Â: "A",
  ê: "e",
  Ê: "E",
  î: "i",
  Î: "I",
  ô: "o",
  Ô: "O",
  û: "u",
  Û: "U",
}

const SKIP_TYPES = new Set([
  "password",
  "email",
  "file",
  "checkbox",
  "radio",
  "hidden",
  "number",
  "range",
  "date",
  "time",
  "color",
])

/** Catalog is English — fold TR letters, drop other non-ASCII. */
export function toEnglishChars(value: string): string {
  let out = ""
  for (const ch of value) {
    out += FOLD[ch] ?? ch
  }
  return out.replace(/[^\x20-\x7E]/g, "")
}

export function shouldSanitizeInput(type?: string) {
  return !type || !SKIP_TYPES.has(type)
}
