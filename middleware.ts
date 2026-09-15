import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your_secret_key";

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify',
  '/auth/reset-password',
  '/auth/signout',
  '/api/auth',
  '/status-check',
  '/api/status-check',
  '/api/admin/marketing-campaigns/pending',
  '/api/exam-results',
];

// Function to check if the path is public
const isPublicPath = (path: string) =>
  publicPaths.some((publicPath) => path === publicPath) ||
  path.startsWith('/auth') ||
  path.startsWith('/api/auth') ||
  path.startsWith('/_next') ||
  path.startsWith('/static') ||
  path.startsWith('/images') ||
  path.startsWith('/uploads') ||
  path.startsWith('/favicon') ||
  /\.(.*)$/.test(path); // Allow all files with extensions (static assets)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow public paths without authentication
  if (isPublicPath(path)) {
    // console.log(`[Middleware] Public path: ${path}, allowing access`);
    return NextResponse.next();
  }
  
  // Get the NextAuth token
  try {
    
    const token = await getToken({ 
      req: request,
      secret: NEXTAUTH_SECRET
    });
    
    // console.log(`[Middleware] NextAuth token found: ${!!token}`);
    
    // If no token, redirect to signin
    if (!token) {
      console.log(`[Middleware] No NextAuth token, redirecting to signin`);
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Admin routes check
    if (path.startsWith('/admin') && token.userType !== 'PLATFORM') {
      console.log(`[Middleware] Non-platform user attempting to access admin route`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Dashboard routes check
    if (path.startsWith('/dashboard') && token.userType === 'PLATFORM') {
      console.log(`[Middleware] Platform user attempting to access dashboard route`);
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Block suspended companies completely
    if (token.companyStatus === 'suspended' || token.companyStatus === 'inactive') {
      if (!path.startsWith('/auth') && !path.startsWith('/api/auth')) {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ success: false, message: 'Your company account is suspended.' }, { status: 403 });
        }
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('error', 'AccountSuspended');
        return NextResponse.redirect(url);
      }
    }

    // Subscription Read-Only Enforcement for Tenant APIs
    if (token.userType === 'TENANT' && token.subscriptionEndDate) {
      const endDate = new Date(token.subscriptionEndDate as string).getTime();
      const now = Date.now();
      
      // If expired, block POST/PUT/PATCH/DELETE on tenant APIs (excluding auth)
      if (now > endDate && path.startsWith('/api/') && !path.startsWith('/api/auth')) {
        const method = request.method;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          return NextResponse.json({ 
            success: false, 
            message: 'Subscription Expired. Read-Only Mode active.',
            error: { code: 'SUBSCRIPTION_EXPIRED' }
          }, { status: 402 });
        }
      }
    }
    
    // Company role - add company ID header to all API requests for tenant isolation
    if (token.role === 'company' && token.companyId) {
      console.log(`[Middleware] Adding company ID header: ${token.companyId}`);
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-company-id', token.companyId as string);
      
      // Return a new request with the modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Error processing ${path}:`, error);
    // In case of error during auth check, redirect to login
    if (!isPublicPath(path)) {
      const url = new URL('/auth/signin', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

// Configure paths for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 