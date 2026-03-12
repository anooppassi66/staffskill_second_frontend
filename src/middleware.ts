import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = new Set<string>(['/login', '/admin'])

const ADMIN_ALLOWED = [
  '/admin-dashboard',
  '/categories',
  '/courses',
  '/profile',
  '/employees',
  '/employee-certificates',
  '/quiz',
  '/settings',
  '/add-employee',
  '/admin/enrollments',
]

const USER_ALLOWED = [
  '/',
  '/profile',
  '/settings',
  '/enrolled-courses',
  '/certificates',
  '/quiz/',
]

function isAllowed(pathname: string, allowed: string[]) {
  return allowed.some((p) => {
    if (p.endsWith('/')) return pathname.startsWith(p)
    return pathname === p || pathname.startsWith(p + '/')
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/_next') || pathname.startsWith('/assets') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }
  const token = request.cookies.get('auth_token')?.value
  const role = request.cookies.get('auth_role')?.value
  
  if (!token) {
    if (PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next()
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/login') {
    const target = role === 'admin' ? '/admin-dashboard' : '/'
    return NextResponse.redirect(new URL(target, request.url))
  }
  if (pathname === '/admin') {
    const target = role === 'admin' ? '/admin-dashboard' : '/'
    return NextResponse.redirect(new URL(target, request.url))
  }
  if (role === 'admin') {
    if (!isAllowed(pathname, ADMIN_ALLOWED)) {
      const homeUrl = new URL('/admin-dashboard', request.url)
      return NextResponse.redirect(homeUrl)
    }
  } else {
    if (!isAllowed(pathname, USER_ALLOWED)) {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
