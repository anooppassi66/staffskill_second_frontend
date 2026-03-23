import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = new Set<string>(['/login', '/admin'])

const ADMIN_ALLOWED = [
  '/admin-dashboard',
  '/categories',
  '/courses',
  '/employees',
  '/employee-certificates',
  '/quiz',
  '/add-employee',
  '/admin/enrollments',
  '/admin/enrolled-employees',
]

const USER_ALLOWED = [
  '/',
  '/profile',
  '/settings',
  '/enrolled-courses',
  '/certificates',
  '/quiz',
]

function isAllowed(pathname: string, allowed: string[]) {
  return allowed.some((p) => {
    if (p.endsWith('/')) return pathname.startsWith(p)
    return pathname === p || pathname.startsWith(p + '/')
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value
  const role = request.cookies.get('auth_role')?.value

  // 🔐 Not logged in
  if (!token) {
    if (PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next()
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🔁 Prevent accessing login pages after login
  if (pathname === '/login' || pathname === '/admin') {
    const target = role === 'admin' ? '/admin-dashboard' : '/'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 🟢 ADMIN LOGIC
  if (role === 'admin') {
    // ❌ Admin trying to access USER routes
    if (isAllowed(pathname, USER_ALLOWED)) {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url))
    }

    // ❌ Not in admin allowed
    if (!isAllowed(pathname, ADMIN_ALLOWED)) {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url))
    }
  }

  // 🔵 USER LOGIC
  else {
    // ❌ User trying to access ADMIN routes
    if (isAllowed(pathname, ADMIN_ALLOWED)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // ❌ Not in user allowed
    if (!isAllowed(pathname, USER_ALLOWED)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}