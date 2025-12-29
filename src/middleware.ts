import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Routes that require authentication
const protectedRoutes = ['/candidate/dashboard', '/candidate/profile', '/candidate/applications', '/candidate/settings'];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/candidate/signup'];

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const { pathname } = request.nextUrl;

    // Check if accessing a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname === route);

    // Verify token if it exists
    let isValidToken = false;
    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jose.jwtVerify(token, secret);
            isValidToken = true;
        } catch {
            // Token is invalid or expired
            isValidToken = false;
        }
    }

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !isValidToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth routes
    if (isAuthRoute && isValidToken) {
        return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match protected routes
        '/candidate/dashboard/:path*',
        '/candidate/profile/:path*',
        '/candidate/applications/:path*',
        '/candidate/settings/:path*',
        // Match auth routes
        '/login',
        '/candidate/signup',
    ],
};
