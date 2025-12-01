import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth needed
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/payment/webhook',
    '/',
  ]

  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Customer routes pattern: /[storeSlug]/[outletSlug]/*
  // Pattern: /store-name/outlet-name/order, /store-name/outlet-name/cart, etc.
  const customerRoutePattern = /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/(order|menu|cart|checkout|confirmation)/
  const customerMatch = pathname.match(customerRoutePattern)

  if (customerMatch) {
    const [, storeSlug, outletSlug] = customerMatch

    // Customer routes - no auth required, but add context headers
    const response = NextResponse.next()
    response.headers.set('x-store-slug', storeSlug)
    response.headers.set('x-outlet-slug', outletSlug)
    return response
  }

  // Legacy customer routes pattern: /[storeSlug]/order (without outlet)
  // Redirect to main outlet
  const legacyCustomerPattern = /^\/([a-z0-9-]+)\/(order|cart|checkout|confirmation)/
  const legacyMatch = pathname.match(legacyCustomerPattern)

  if (legacyMatch && !pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    // This route will be handled by the page itself to redirect to outlet
    return NextResponse.next()
  }

  // Onboarding routes - require auth
  if (pathname.startsWith('/onboarding')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    try {
      await jwtVerify(token, jwtSecret)
      return NextResponse.next()
    } catch {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // API routes that need auth
  if (pathname.startsWith('/api/')) {
    // Skip auth for public API routes
    const publicApiRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/payment/webhook',
      '/api/stores/', // Public store lookup
      '/api/outlets/', // Public outlet lookup
    ]

    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const { payload } = await jwtVerify(token, jwtSecret)

      // Add user context to request headers for API routes
      const response = NextResponse.next()
      response.headers.set('x-user-id', payload.userId as string)
      response.headers.set('x-store-id', payload.storeId as string)
      response.headers.set('x-user-role', payload.role as string)

      // Get current outlet from cookie
      const currentOutlet = request.cookies.get('current_outlet')?.value
      if (currentOutlet) {
        response.headers.set('x-outlet-id', currentOutlet)
      }

      return response
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  // Admin routes - require auth
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    try {
      const { payload } = await jwtVerify(token, jwtSecret)

      // Check if user has valid admin role
      // Support both old roles (owner, staff) and new roles (tenant_admin, outlet_admin, staff)
      const validAdminRoles = ['owner', 'staff', 'tenant_admin', 'outlet_admin']
      if (!validAdminRoles.includes(payload.role as string)) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Add user context to request headers
      const response = NextResponse.next()
      response.headers.set('x-user-id', payload.userId as string)
      response.headers.set('x-store-id', payload.storeId as string)
      response.headers.set('x-user-role', payload.role as string)

      // Get current outlet from cookie
      const currentOutlet = request.cookies.get('current_outlet')?.value
      if (currentOutlet) {
        response.headers.set('x-outlet-id', currentOutlet)
      }

      return response
    } catch {
      // Invalid token - redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/onboarding/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
