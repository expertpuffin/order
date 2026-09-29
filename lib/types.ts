
export type BusinessStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"

export const BUSINESS_TYPES = [
  "Canteen",
  "Cafe",
  "Cafe Bistro / Lounge",
  "Pizzeria",
  "Fish & Chips",
  "Fried Chicken",
  "Kebab",
  "Takeaway",
  "Restaurant",
  "Wholesaler",
  "Catering",
  "Off-Licence",
  "Supermarket",
  "Other",
] as const

export type BusinessType = (typeof BUSINESS_TYPES)[number]

export type Business = {
  id: string
  businessNumber: string
  businessName: string
  tradingName: string
  businessType: string
  addressLine1: string
  city: string
  postcode: string
  contactName: string
  contactPhone: string
  openTime: string
  closeTime: string
  deliveryTime: string | null
  owner: string
  ownerId: string | null
  products: number
  status: BusinessStatus
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  createdAt: string
  /** One = door (trial counts as One) */
  subscription?: {
    plan: string | null
    status: string | null
    startDate: string | null
    endDate: string | null
    trialMonths: number | null
    cancelAtPeriodEnd: boolean
  } | null
}

export const UNIT_OF_MEASURE = [
  "BOX",
  "EACH",
  "KG",
  "PACK",
  "POSET",
  "ml",
  "cl",
  "l",
  "fl_oz",
  "gal",
  "g",
  "kg",
  "mg",
  "oz",
  "lb",
  "pcs",
  "pack",
  "box",
  "bottle",
  "can",
  "portion",
  "serving",
  "slice",
  "pair",
  "set",
] as const
/** Canonical packaging types from Product.packagings[].type */
export const PACKAGING_TYPES = ["EACH", "PACK", "BOX", "PALLET"] as const
/** UI: Available Sales Units (Item Ekleme) — PALLET hariç */
export const SALES_UNIT_TYPES = ["EACH", "PACK", "BOX"] as const
/** @deprecated use PACKAGING_TYPES */
export const PACKAGING_OPTIONS = PACKAGING_TYPES

export type PackagingType = (typeof PACKAGING_TYPES)[number]
export type SalesUnitType = (typeof SALES_UNIT_TYPES)[number]

export const SUPPLIER_STATUSES = ["active", "inactive"] as const
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number]

export type ProductCategory = {
  id: string
  code: string | null
  name: string
  slug: string | null
  isPrimary: boolean
}

/** Catalog category entity (admin CRUD /api/admin/categories) */
export type Category = {
  id: string
  name: string
  slug: string
  code: string | null
  description: string
  imageUrl: string | null
  color: string | null
  icon: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  children?: Category[]
}

export const TEAM_PERMISSIONS = [
  "orders",
  "inventory",
  "billing",
  "team",
  "settings",
] as const

export type TeamPermission = (typeof TEAM_PERMISSIONS)[number]

/** Business team role catalog (/api/roles) — not platform user/admin/master */
export type TeamRole = {
  id: string
  name: string
  permissions: TeamPermission[]
  description: string
  isSystem: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string | null
  updatedAt: string | null
}

export type ProductSupplier = {
  id: string
  name: string
  itemCode: string
  cost: number | null
  deliveryCost: number | null
  collectionCost: number | null
  currency: string
  priority: number
  inStock: boolean
  status: SupplierStatus
  vatRate: number | null
  onOffer: boolean
  offerCollectionCost: number | null
  offerDeliveryCost: number | null
  stockQuantity: number | null
  /** Warehouse location — supplier panel only */
  shelfNo: string | null
  /** Derived: lowest priority within its packaging */
  isPreferred: boolean
}

export type ProductPackaging = {
  id: string
  type: PackagingType
  barcode: string | null
  suppliers: ProductSupplier[]
}

export type ProductPriceTier = {
  label: string
  value: string
}

export type ProductAllergenChip = {
  id: string
  label: string
  icon: string
}

export type ProductNutritionExtra = {
  label: string
  value: number | null
  unit: string
}

export type ProductNutritionUnits = {
  fat: string
  protein: string
  carbohydrate: string
  sugars: string
  fibre: string
  salt: string
  saturates: string
}

export type ProductNutrition = {
  basis: "per100g" | "perServing"
  /** per 100 tabındaki birim — 100 sabittir */
  basisUnit: "g" | "ml"
  /** Pack has no nutrition table (cleaning, equipment). Mineral extras still count as filled. */
  notOnPack: boolean
  energyKcal: number | null
  fat: number | null
  protein: number | null
  carbohydrate: number | null
  sugars: number | null
  fibre: number | null
  salt: number | null
  saturates: number | null
  units: ProductNutritionUnits
  /** Ürüne özel ek satırlar (kafein, alkol, vitamin…) */
  extras: ProductNutritionExtra[]
}

export type Product = {
  id: string
  itemCode: string
  brandCode: string | null
  sequence: number | null
  packagingCodes: Partial<Record<PackagingType, string | null>>
  /** Preferred packaging barcode (EACH or first) */
  barcode: string | null
  brand: string | null
  name: string
  description: string | null
  webDescription: string | null
  longDescription: string | null
  sizeLabel: string | null
  unitSize: number
  packSize: string | null
  unitOfMeasure: (typeof UNIT_OF_MEASURE)[number] | string
  /** Derived from packagings[].type */
  packagingOptions: PackagingType[]
  packagings: ProductPackaging[]
  /** Catalog default sales unit — not always EACH */
  preferredPackagingType: PackagingType | null
  mainCategoryId: string | null
  mainCategoryName: string | null
  /** Populated leaf categories under main (0+) */
  subCategories: Array<{
    id: string
    name: string
    slug: string | null
    code: string | null
  }>
  /** Compat — subCategories[0] */
  subCategoryId: string | null
  subCategoryName: string | null
  categorySlug: string | null
  /** Legacy embedded snapshot / categoryPath */
  categories: ProductCategory[]
  usageTags: string[]
  pricePlaceholder: string | null
  priceTiers: ProductPriceTier[]
  allergens: string | null
  allergenChips: ProductAllergenChip[]
  /** UK 14: none present. */
  allergensNone: boolean
  /** Not a food product. */
  allergensNotApplicable: boolean
  ingredients: string | null
  /** No ingredient list on pack. */
  ingredientsNotApplicable: boolean
  nutritionNote: string | null
  nutrition: ProductNutrition | null
  storage: string | null
  netWeight: number
  shelfNo: string | null
  ageRestriction: boolean
  imageUrl: string | null
  images: Array<{
    url: string
    key?: string | null
    sortOrder?: number
    alt?: string | null
  }>
  /** Preferred packaging suppliers (compat) */
  suppliers: ProductSupplier[]
  supplierSku: string | null
  isActive: boolean
  createdAt: string
}

export const ORDER_STATUSES = [
  "draft",
  "submitted",
  "sent",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const

export const ORDER_UNITS = ["BOX", "EACH", "KG", "PACK", "POSET"] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type OrderUnit = (typeof ORDER_UNITS)[number]

export type OrderItem = {
  id: string
  type: string
  productId: string | null
  supplierSku: string
  orderiaCode: string | null
  quantity: number
  unit: OrderUnit
  brand: string | null
  description: string
  unitSize: number | null
  packSize: string | null
  comment: string | null
  unitCost: number | null
  currency: string
}

export type OrderStatusHistory = {
  status: OrderStatus
  at: string
  by: string | null
  note: string | null
}

export type Order = {
  id: string
  orderNumber: string
  businessId: string
  createdBy: string
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  fulfillmentMethod: "delivery" | "collection"
  paymentOption: string | null
  customerNo: string | null
  snapshot: {
    businessNumber: string | null
    businessName: string | null
    contactName: string | null
    contactPhone: string | null
    address: {
      line_1: string | null
      line_2: string | null
      post_town: string | null
      county: string | null
      postcode: string | null
    }
    openTime: string | null
    closeTime: string | null
    sentBy: {
      name: string | null
      phone: string | null
      email: string | null
    }
  }
  deliveryTime: string | null
  orderDate: string
  requestedDeliveryDate: string
  supplier: {
    name: string | null
  }
  salesperson: {
    code: string | null
    phone: string | null
    email: string | null
  }
  specialNote: string | null
  items: OrderItem[]
}

export const PLATFORM_ROLES = ["user", "admin", "master", "supplier"] as const
export type PlatformRole = (typeof PLATFORM_ROLES)[number]

/** Catalog Supplier entity (admin CRUD) — not ProductSupplier embedded row */
export type CatalogSupplier = {
  id: string
  name: string
  code: string
  legalName: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SupplierRoleOption = {
  id: string
  name: string
  slug: string
  description: string
}

export type SupplierMembership = {
  id: string
  status: "active" | "invited" | "disabled"
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    isActive: boolean
  }
  role: {
    id: string
    name: string
    slug: string
  }
  createdAt: string | null
}

/** Orderia Business Admin Panel staff permissions */
export const STAFF_PERMISSIONS = [
  "dashboard.read",
  "businesses.read",
  "businesses.manage",
  "products.read",
  "products.manage",
  "suppliers.read",
  "suppliers.manage",
  "categories.manage",
  "orders.read",
  "orders.manage",
  "app_cms.manage",
  "site_cms.manage",
  "users.read",
  "users.manage",
  "staff_roles.manage",
  "team_roles.manage",
  "platform_roles.read",
  "notifications.read",
  "notifications.send",
  "feedback.read",
  "feedback.manage",
  "crashes.read",
  "crashes.manage",
  "uploads.manage",
  "gallery.read",
  "gallery.manage",
  "audit_logs.read",
] as const
export type StaffPermission = (typeof STAFF_PERMISSIONS)[number]

export type StaffRole = {
  id: string
  name: string
  slug: string
  permissions: StaffPermission[]
  description: string
  isSystem: boolean
  isActive: boolean
  sortOrder: number
  userCount?: number
  createdAt?: string | null
  updatedAt?: string | null
}

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: PlatformRole
  staffRoleId: string | null
  staffRole: { id: string; name: string; slug: string } | null
  permissions: StaffPermission[]
  isEmailVerified: boolean
  lastLoginAt: string | null
  isActive: boolean
  googleId: string | null
  appleId: string | null
  createdAt: string
  businessId?: string | null
  businessStatus?: BusinessStatus | null
  businessNumber?: string | null
  dateOfBirth?: string | null
  occupation?: string | null
  occupationOther?: string | null
  lastBirthdayGreetingYear?: number | null
}

export type NotificationCampaign = {
  id: string
  title: string
  body: string
  subject: string
  htmlBody: string
  channels: Array<"inbox" | "push" | "email">
  audience: {
    mode: "users" | "all_users" | "business"
    userIds: string[]
    businessIds: string[]
  }
  status: "draft" | "sending" | "sent" | "failed" | "partial"
  stats: {
    targeted: number
    inbox: number
    pushSent: number
    pushFail: number
    emailSent: number
    emailFail: number
    emailSkipped: number
  }
  errorSummary: string
  createdByName: string | null
  sentAt: string | null
  createdAt: string | null
}

export type Role = {
  id: PlatformRole
  name: string
  description: string
  permissions?: string[]
  userCount?: number
}

export type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
  /** When set, response spans multiple logical pages in one list */
  pageFrom?: number
  pageTo?: number
  range?: boolean
}

export type OnboardingBuckets = {
  registered_unverified: number
  verified_no_business: number
  business_pending: number
  business_rejected: number
  business_approved: number
  can_order: number
}

export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ApiErrorBody = {
  success: false
  message: string
  errors?: string[]
}

export type LocalizedString = {
  en: string
  tr: string
}

export const APP_PLATFORMS = ["all", "ios", "android"] as const
export type AppPlatform = (typeof APP_PLATFORMS)[number]

export const APP_CONTENT_TYPES = [
  "banner",
  "carousel_slide",
  "bottom_sheet",
  "popup",
  "fullscreen",
] as const
export type AppContentType = (typeof APP_CONTENT_TYPES)[number]

export const APP_PLACEMENTS = [
  "home_carousel",
  "home_banner",
  "account_banner",
  "global_banner_bar",
  "global_bottom_sheet",
  "global_popup",
  "global_fullscreen",
] as const
export type AppPlacement = (typeof APP_PLACEMENTS)[number]

export const APP_SHEET_SNAPS = ["auto", "medium"] as const
export type AppSheetSnap = (typeof APP_SHEET_SNAPS)[number]

/** Tip → izin verilen placement’lar (backend ile aynı) */
export const APP_TYPE_PLACEMENTS: Record<AppContentType, readonly AppPlacement[]> =
  {
    carousel_slide: ["home_carousel"],
    banner: ["home_banner", "account_banner", "global_banner_bar"],
    bottom_sheet: ["global_bottom_sheet"],
    popup: ["global_popup"],
    fullscreen: ["global_fullscreen"],
  }

export const APP_PLACEMENT_LABELS: Record<AppPlacement, string> = {
  home_carousel: "Home carousel",
  home_banner: "Home banner",
  account_banner: "Account banner",
  global_banner_bar: "Banner bar",
  global_bottom_sheet: "Bottom sheet",
  global_popup: "Popup",
  global_fullscreen: "Fullscreen",
}

/** Auth-styled template catalog (must match backend config/appContentTemplates.js) */
export const APP_CONTENT_TEMPLATES = [
  { id: "banner_bar_simple", type: "banner" as const, placements: ["global_banner_bar"] as const, label: "Bar · Simple", description: "Auth subtitle strip" },
  { id: "banner_bar_cta", type: "banner" as const, placements: ["global_banner_bar"] as const, label: "Bar · CTA", description: "Welcome orange pill CTA" },
  { id: "banner_bar_icon", type: "banner" as const, placements: ["global_banner_bar"] as const, label: "Bar · Icon", description: "Round icon + Space Mono" },
  { id: "banner_bar_urgent", type: "banner" as const, placements: ["global_banner_bar"] as const, label: "Bar · Urgent", description: "High-visibility orange bar" },
  { id: "banner_card_simple", type: "banner" as const, placements: ["home_banner", "account_banner"] as const, label: "Card · Simple", description: "Acquisition bordered card" },
  { id: "banner_card_image", type: "banner" as const, placements: ["home_banner", "account_banner"] as const, label: "Card · Image", description: "Thumb + auth copy" },
  { id: "banner_card_promo", type: "banner" as const, placements: ["home_banner", "account_banner"] as const, label: "Card · Promo", description: "Orange promo + white pill" },
  { id: "carousel_image", type: "carousel_slide" as const, placements: ["home_carousel"] as const, label: "Carousel · Image", description: "Onboarding slide" },
  { id: "carousel_overlay", type: "carousel_slide" as const, placements: ["home_carousel"] as const, label: "Carousel · Overlay", description: "Dark overlay + Space Mono" },
  { id: "carousel_split", type: "carousel_slide" as const, placements: ["home_carousel"] as const, label: "Carousel · Split", description: "Image / text split" },
  { id: "sheet_simple", type: "bottom_sheet" as const, placements: ["global_bottom_sheet"] as const, label: "Sheet · Simple", description: "Sign-in style sheet" },
  { id: "sheet_hero", type: "bottom_sheet" as const, placements: ["global_bottom_sheet"] as const, label: "Sheet · Hero", description: "Large top image" },
  { id: "sheet_compact", type: "bottom_sheet" as const, placements: ["global_bottom_sheet"] as const, label: "Sheet · Compact", description: "Medium snap" },
  { id: "sheet_checklist", type: "bottom_sheet" as const, placements: ["global_bottom_sheet"] as const, label: "Sheet · Checklist", description: "Acquisition rows" },
  { id: "popup_center", type: "popup" as const, placements: ["global_popup"] as const, label: "Popup · Center", description: "Centered auth card" },
  { id: "popup_image", type: "popup" as const, placements: ["global_popup"] as const, label: "Popup · Image", description: "Top image modal" },
  { id: "popup_alert", type: "popup" as const, placements: ["global_popup"] as const, label: "Popup · Alert", description: "Icon ring + dual CTA" },
  { id: "fullscreen_takeover", type: "fullscreen" as const, placements: ["global_fullscreen"] as const, label: "Fullscreen · Takeover", description: "Welcome gradient" },
  { id: "fullscreen_split", type: "fullscreen" as const, placements: ["global_fullscreen"] as const, label: "Fullscreen · Split", description: "Half image / half copy" },
  { id: "fullscreen_story", type: "fullscreen" as const, placements: ["global_fullscreen"] as const, label: "Fullscreen · Story", description: "Edge-to-edge story" },
] as const

export type AppContentTemplateId = (typeof APP_CONTENT_TEMPLATES)[number]["id"]

export function templatesForTypePlacement(
  type: AppContentType,
  placement: AppPlacement
) {
  return APP_CONTENT_TEMPLATES.filter(
    (t) => t.type === type && (t.placements as readonly string[]).includes(placement)
  )
}

export const APP_CTA_KINDS = ["none", "url", "deep_link", "route"] as const
export type AppCtaKind = (typeof APP_CTA_KINDS)[number]

export type AppUpdatePolicy = {
  id: string
  platform: AppPlatform
  minVersion: string
  latestVersion: string
  forceUpdate: boolean
  storeUrl: { ios: string; android: string }
  title: LocalizedString
  message: LocalizedString
  isActive: boolean
  updatedAt: string | null
}

export type AppUpdatePolicyUpsert = {
  platform?: AppPlatform
  minVersion: string
  latestVersion: string
  forceUpdate?: boolean
  storeUrl?: { ios?: string; android?: string }
  title?: LocalizedString
  message?: LocalizedString
  isActive?: boolean
}

export type AppContent = {
  id: string
  type: AppContentType
  placement: AppPlacement
  template: AppContentTemplateId | string | null
  title: LocalizedString
  body: LocalizedString
  imageUrl: string | null
  ctaLabel: LocalizedString
  cta: { kind: AppCtaKind; value: string }
  sortOrder: number
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  dismissible: boolean
  priority: number
  theme: { background: string | null; text: string | null }
  sheet: { snap: AppSheetSnap; showOncePerVersion: boolean }
  targeting: {
    locales: string[]
    platforms: string[]
    minAppVersion: string | null
    maxAppVersion: string | null
    authRequired: boolean
  }
  updatedAt: string | null
}

export type AppContentUpsert = {
  type?: AppContentType
  placement?: AppPlacement
  template?: AppContentTemplateId | string | null
  title?: LocalizedString
  body?: LocalizedString
  imageUrl?: string | null
  ctaLabel?: LocalizedString
  cta?: { kind: AppCtaKind; value?: string }
  sortOrder?: number
  isActive?: boolean
  startsAt?: string | null
  endsAt?: string | null
  dismissible?: boolean
  priority?: number
  theme?: { background?: string | null; text?: string | null }
  sheet?: { snap?: AppSheetSnap; showOncePerVersion?: boolean }
  targeting?: {
    locales?: string[]
    platforms?: string[]
    minAppVersion?: string | null
    maxAppVersion?: string | null
    authRequired?: boolean
  }
}

/** Website CMS — blog posts + legal pages (cookie, privacy, terms) */
export const SITE_PAGE_TYPES = [
  "blog",
  "cookie_policy",
  "privacy_policy",
  "terms",
  "page",
] as const
export type SitePageType = (typeof SITE_PAGE_TYPES)[number]

export const SITE_PAGE_TYPE_LABELS: Record<SitePageType, string> = {
  blog: "Blog post",
  cookie_policy: "Cookie policy",
  privacy_policy: "Privacy policy",
  terms: "Terms of service",
  page: "Static page",
}

export const SITE_PAGE_STATUSES = ["draft", "published", "archived"] as const
export type SitePageStatus = (typeof SITE_PAGE_STATUSES)[number]

export type SitePage = {
  id: string
  type: SitePageType
  slug: string
  title: LocalizedString
  excerpt: LocalizedString
  body: LocalizedString
  coverImageUrl: string | null
  status: SitePageStatus
  seoTitle: LocalizedString
  seoDescription: LocalizedString
  publishedAt: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SitePageUpsert = {
  type?: SitePageType
  slug?: string
  title?: LocalizedString
  excerpt?: LocalizedString
  body?: LocalizedString
  coverImageUrl?: string | null
  status?: SitePageStatus
  seoTitle?: LocalizedString
  seoDescription?: LocalizedString
  publishedAt?: string | null
  sortOrder?: number
  isActive?: boolean
}
