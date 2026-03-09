export type Role = "CUSTOMER" | "ADMIN";

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: Role;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  name: string;
  price: number;
  stock_qty?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  rating?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface CartItem {
  variant_id: string;
  qty: number;
  promo_code?: string;
  unit_price?: number;
  line_total?: number;
  product_name?: string;
  variant_name?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal?: number;
  total?: number;
  discount_total?: number;
  currency?: string;
}

export interface PricingCalculation {
  unit_price: number;
  subtotal: number;
  discount_total: number;
  total: number;
  rules_applied?: string[];
}

export interface Order {
  id: string;
  cart_id: string;
  status: string;
  payment_method: "cod" | "online";
  payment_status?: string;
  payment_id?: string;
  total?: number;
  created_at?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
