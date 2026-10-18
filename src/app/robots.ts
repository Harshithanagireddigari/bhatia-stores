import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api/',
        '/account',
        '/orders',
        '/cart',
        '/wishlist',
        '/checkout',
        '/login',
        '/register',
        '/logout',
        '/forgot-password',
        '/reset-password',
        '/otp',
        '/delivery',
        '/delivery-agents',
      ],
    },
    sitemap: 'https://www.bhatiastores.com/sitemap.xml',
  }
}
