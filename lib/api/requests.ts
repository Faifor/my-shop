import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  BulkSkuPriceUpdate,
  BulkSkuStatusUpdate,
  BulkSkuStockUpdate,
  Cart,
  Category,
  InventoryCard,
  Order,
  PricingRule,
  Product,
  ProductVariant,
  Review,
  UserRead,
} from "@/types/api";



const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function normalizeImageUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const apiOrigin = API_URL.replace(/\/api\/v1\/?$/, "");
  return `${apiOrigin}/${url.replace(/^\/+/, "")}`;
}

type CatalogProductApi = {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  category_id?: number;
  rating?: number;
  average_rating?: number;
  base_price?: number | string;
  images?: Array<{ id?: number; url?: string; image_url?: string; alt?: string; is_primary?: boolean; sort_order?: number }>;
  variants?: ProductVariant[];
};

function normalizeCatalogProduct(product: CatalogProductApi): Product {
  const normalizedImages = (product.images ?? []).map((image) => ({
    id: image.id,
    url: normalizeImageUrl(image.url ?? image.image_url),
    alt: image.alt,
  })).filter((image) => Boolean(image.url));

  const normalizedPrice = product.base_price !== undefined && product.base_price !== null
    ? Number(product.base_price)
    : undefined;

  return {
    id: product.id,
    name: product.name ?? product.title ?? "Без названия",
    description: product.description,
    category_id: product.category_id,
    rating: product.rating ?? product.average_rating ?? 0,
    images: normalizedImages,
    variants: product.variants,
    base_price: normalizedPrice,
  };
}

export const authApi = {
  register: (payload: { email: string; full_name: string; phone?: string; password: string; role?: UserRead["role"] }) =>
    apiClient<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    apiClient<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  refresh: (payload: { refresh_token: string }) =>
    apiClient<AuthResponse>("/auth/refresh", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiClient<UserRead>("/auth/me"),
  updateProfile: (payload: Partial<Pick<UserRead, "email" | "full_name" | "phone">>) =>
    apiClient<UserRead>("/auth/profile", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const catalogApi = {
  getCategories: () => apiClient<Category[]>("/catalog/categories"),
  getProducts: async () => {
    const products = await apiClient<CatalogProductApi[]>("/catalog/products");
    return products.map(normalizeCatalogProduct);
  },
  addReview: (productId: number, payload: { user_id: number; rating: number; review: string }) =>
    apiClient<Review>(`/catalog/products/${productId}/reviews`, { method: "POST", body: JSON.stringify(payload) }),
  getReviews: (productId: number) => apiClient<Review[]>(`/catalog/products/${productId}/reviews`),
};

export const cartApi = {
  createCart: (payload: { user_id: number }) => apiClient<Cart>("/cart/", { method: "POST", body: JSON.stringify(payload) }),
  getCart: (cartId: number) => apiClient<Cart>(`/cart/${cartId}`),
  updateItem: (cartId: number, variantId: number, payload: { qty: number; promo_code?: string }) =>
    apiClient<Cart>(`/cart/${cartId}/items/${variantId}`, {
      method: "PUT",
      body: JSON.stringify({ ...payload, variant_id: variantId }),
    }),
};

export const orderApi = {
  checkout: (payload: { cart_id: number; payment_method: "yookassa" | "cod" }) =>
    apiClient<Order>("/orders/checkout", { method: "POST", body: JSON.stringify(payload) }),
  getOrders: () => apiClient<Order[]>("/orders/"),
  getOrder: (orderId: number) => apiClient<Order>(`/orders/${orderId}`),
  adminSetStatus: (orderId: number, payload: { status: string }) =>
    apiClient<Order>(`/orders/${orderId}/status`, { method: "POST", body: JSON.stringify(payload) }),
  adminConfirmCod: (orderId: number) => apiClient<Order>(`/orders/${orderId}/cod/confirm`, { method: "POST" }),
};

export const paymentApi = {
  yookassaWebhook: (payload: unknown, signature?: string) =>
    apiClient<Record<string, unknown>>("/payments/yookassa/webhook", {
      method: "POST",
      headers: signature ? { "X-Webhook-Secret": signature } : undefined,
      body: JSON.stringify(payload),
    }),
};

export const adminApi = {
  createCategory: (payload: { name: string; external_key?: string }) =>
    apiClient<Category>("/admin/categories", { method: "POST", body: JSON.stringify(payload) }),
  getCategories: () => apiClient<Category[]>("/admin/categories"),
  createProduct: (payload: { name: string; category_id: number; external_key?: string }) =>
    apiClient<Product>("/admin/products", { method: "POST", body: JSON.stringify(payload) }),
  getProducts: () => apiClient<Product[]>("/admin/products"),
  uploadProductImages: (productId: number, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return apiClient(`/admin/products/${productId}/images`, { method: "POST", body: form, headers: {} });
  },
  createSku: (payload: { product_id: number; sku: string; attributes: Record<string, unknown> }) =>
    apiClient<ProductVariant>("/admin/skus", { method: "POST", body: JSON.stringify(payload) }),
  getSkus: () => apiClient<ProductVariant[]>("/admin/skus"),
  setInventory: (payload: { sku_id: number; stock: number }) =>
    apiClient<Record<string, unknown>>("/admin/inventory", { method: "POST", body: JSON.stringify(payload) }),
  getInventoryCard: (skuId: number, query?: { created_from?: string; created_to?: string }) => {
    const params = new URLSearchParams();
    if (query?.created_from) params.set("created_from", query.created_from);
    if (query?.created_to) params.set("created_to", query.created_to);
    return apiClient<InventoryCard>(`/admin/skus/${skuId}/inventory-card${params.toString() ? `?${params.toString()}` : ""}`);
  },
  createPricingRule: (payload: { name: string; discount_percent: number; is_active: boolean }) =>
    apiClient<PricingRule>("/admin/pricing-rules", { method: "POST", body: JSON.stringify(payload) }),
  getPricingRules: () => apiClient<PricingRule[]>("/admin/pricing-rules"),
  bulkSkuPrices: (payload: BulkSkuPriceUpdate[]) =>
    apiClient<Record<string, unknown>>("/admin/bulk/sku-prices", { method: "POST", body: JSON.stringify(payload) }),
  bulkSkuStocks: (payload: BulkSkuStockUpdate[]) =>
    apiClient<Record<string, unknown>>("/admin/bulk/sku-stocks", { method: "POST", body: JSON.stringify(payload) }),
  bulkSkuStatuses: (payload: BulkSkuStatusUpdate[]) =>
    apiClient<Record<string, unknown>>("/admin/bulk/sku-statuses", { method: "POST", body: JSON.stringify(payload) }),
  importProducts: (
    payload: { filename: string; content: string },
    query?: { dry_run?: boolean; upsert?: boolean; rollback_on_error?: boolean; external_key?: string; version?: string },
  ) => {
    const params = new URLSearchParams();
    if (query?.dry_run !== undefined) params.set("dry_run", String(query.dry_run));
    if (query?.upsert !== undefined) params.set("upsert", String(query.upsert));
    if (query?.rollback_on_error !== undefined) params.set("rollback_on_error", String(query.rollback_on_error));
    if (query?.external_key) params.set("external_key", query.external_key);
    if (query?.version) params.set("version", query.version);
    return apiClient<Record<string, unknown>>(`/admin/imports/products${params.toString() ? `?${params.toString()}` : ""}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getBusinessRulesReport: () => apiClient<Record<string, unknown>>("/admin/reports/business-rules"),
  getRevenueReport: (query?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    return apiClient<Record<string, unknown>>(`/admin/reports/revenue${params.toString() ? `?${params.toString()}` : ""}`);
  },
  getTopProductsReport: (query?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    return apiClient<Record<string, unknown>>(`/admin/reports/top-products${params.toString() ? `?${params.toString()}` : ""}`);
  },
  getConversionReport: (query?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    return apiClient<Record<string, unknown>>(`/admin/reports/conversion${params.toString() ? `?${params.toString()}` : ""}`);
  },
  getAverageCheckReport: (query?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    return apiClient<Record<string, unknown>>(`/admin/reports/average-check${params.toString() ? `?${params.toString()}` : ""}`);
  },
  getRetentionLtvReport: (query?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    return apiClient<Record<string, unknown>>(`/admin/reports/retention-ltv${params.toString() ? `?${params.toString()}` : ""}`);
  },
};
