import { apiClient } from "@/lib/api/client";
import type { AuthResponse, Cart, Category, Order, PricingCalculation, Product, Review, User } from "@/types/api";

export const authApi = {
  register: (payload: { email: string; full_name: string; phone?: string; password: string; role?: string }) =>
    apiClient<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    apiClient<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiClient<User>("/auth/me"),
  updateProfile: (payload: Partial<Pick<User, "email" | "full_name" | "phone">>) =>
    apiClient<User>("/auth/profile", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const catalogApi = {
  getCategories: () => apiClient<Category[]>("/catalog/categories"),
  getProducts: () => apiClient<Product[]>("/catalog/products"),
  createCategory: (payload: { name: string; description?: string }) =>
    apiClient<Category>("/catalog/categories", { method: "POST", body: JSON.stringify(payload) }),
  createProduct: (payload: Partial<Product>) =>
    apiClient<Product>("/catalog/products", { method: "POST", body: JSON.stringify(payload) }),
  createVariant: (payload: { product_id: string; sku: string; name: string; price: number; stock_qty?: number }) =>
    apiClient("/catalog/variants", { method: "POST", body: JSON.stringify(payload) }),
  updateInventory: (payload: { variant_id: string; stock_qty: number }) =>
    apiClient("/catalog/inventory", { method: "PUT", body: JSON.stringify(payload) }),
  getReviews: (productId: string) => apiClient<Review[]>(`/catalog/products/${productId}/reviews`),
  addReview: (productId: string, payload: { rating: number; text: string }) =>
    apiClient<Review>(`/catalog/products/${productId}/reviews`, { method: "POST", body: JSON.stringify(payload) }),
};

export const cartApi = {
  createCart: (payload: { user_id: string }) => apiClient<Cart>("/cart/", { method: "POST", body: JSON.stringify(payload) }),
  getCart: (cartId: string) => apiClient<Cart>(`/cart/${cartId}`),
  updateItem: (cartId: string, variantId: string, payload: { variant_id: string; qty: number; promo_code?: string }) =>
    apiClient<Cart>(`/cart/${cartId}/items/${variantId}`, { method: "PUT", body: JSON.stringify(payload) }),
};

export const pricingApi = {
  calculate: (payload: { variant_id: string; qty: number; promo_code?: string; context?: Record<string, unknown> }) =>
    apiClient<PricingCalculation>("/pricing/calculate", { method: "POST", body: JSON.stringify(payload) }),
};

export const orderApi = {
  checkout: (payload: { cart_id: string; payment_method: "cod" | "online" }) =>
    apiClient<Order>("/orders/checkout", { method: "POST", body: JSON.stringify(payload) }),
  getOrders: () => apiClient<Order[]>("/orders/"),
  getOrder: (orderId: string) => apiClient<Order>(`/orders/${orderId}`),
};

export const adminApi = {
  getReports: () => apiClient<Record<string, unknown>>("/admin/reports/sales"),
  uploadProductImage: (productId: string, payload: { url: string; alt?: string }) =>
    apiClient(`/admin/products/${productId}/images`, { method: "POST", body: JSON.stringify(payload) }),
};
