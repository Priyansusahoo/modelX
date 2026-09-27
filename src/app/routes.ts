export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MFA_VERIFY: '/mfa-verify',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  // Future eCommerce routes
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string | number) => `/products/${id}`,
  COMPARE: '/compare',
  CART: '/cart',
  CHECKOUT: '/checkout',
} as const
