export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  // Future eCommerce routes
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string | number) => `/products/${id}`,
  COMPARE: '/compare',
  CART: '/cart',
  CHECKOUT: '/checkout',
} as const
