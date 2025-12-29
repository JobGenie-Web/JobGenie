import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication
const protectedRoutes = ['/candidate/dashboard', '/candidate/profile', '/candidate/applications', '/candidate/settings'];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/candidate/login', '/candidate/signup'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if accessing a protected route or auth route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname === route);

    // Skip middleware if not a relevant route
    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    // Create response to modify cookies if needed
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Check for valid session
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth routes
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
    }

    return response;
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
        '/candidate/login',
        '/candidate/signup',
    ],
};
