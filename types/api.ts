export type Role = "user" | "admin" | "manager" | "support";

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface UserRead {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: Role;
  created_at?: string;
}

export interface AuthResponse {
  user: UserRead;
  tokens: Tokens;
}

export interface Category {
  id: number;
  name: string;
  external_key?: string;
}

export interface ProductImage {
  id?: number;
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: number;
  product_id?: number;
  sku: string;
  attributes?: Record<string, unknown>;
  price?: number;
  stock?: number;
  status?: "active" | "inactive" | "archived";
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
  external_key?: string;
  rating?: number;
  base_price?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  review: string;
  created_at?: string;
}

export interface CartItem {
  variant_id: number;
  qty: number;
  promo_code?: string;
  unit_price?: number;
  line_total?: number;
  product_name?: string;
  variant_name?: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  subtotal?: number;
  total?: number;
  discount_total?: number;
  currency?: string;
}

export interface Order {
  id: number;
  cart_id: number;
  status: string;
  payment_method: "yookassa" | "cod";
  payment_status?: string;
  payment_id?: string;
  total?: number;
  created_at?: string;
}

export interface InventoryCard {
  sku_id: number;
  stock: number;
  movements: Array<{ id: number; delta: number; reason?: string; created_at: string }>;
}

export interface PricingRule {
  id: number;
  name: string;
  discount_percent: number;
  is_active: boolean;
}

export interface BulkSkuPriceUpdate {
  sku: string;
  price: number;
}

export interface BulkSkuStockUpdate {
  sku: string;
  stock: number;
}

export interface BulkSkuStatusUpdate {
  sku: string;
  status: "active" | "inactive" | "archived";
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
