import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Role-based route configuration
const roleRoutes: Record<string, string[]> = {
    candidate: [
        '/candidate/dashboard',
        '/candidate/profile',
        '/candidate/applications',
        '/candidate/settings',
        '/candidate/jobs',
        '/candidate/create-profile',
    ],
    employer: [
        '/employer/dashboard',
        '/employer/jobs',
        '/employer/applications',
        '/employer/candidates',
        '/employer/company',
        '/employer/profile',
        '/employer/admins',
        '/employer/settings',
    ],
    mis: [
        '/mis/dashboard',
        '/mis/users',
        '/mis/users/add',
        '/mis/candidates',
        '/mis/employers',
        '/mis/jobs',
        '/mis/settings',
    ],
};

// All protected routes (combined from all roles)
const allProtectedRoutes = Object.values(roleRoutes).flat();

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
    '/login',
    '/candidate/login',
    '/candidate/signup',
    '/employer/login',
    '/employer/signup',
    '/mis/login',
    '/mis/register',
];

// Get the default dashboard for a role
function getDashboardForRole(role: string): string {
    switch (role) {
        case 'candidate':
            return '/candidate/dashboard';
        case 'employer':
            return '/employer/dashboard';
        case 'mis':
            return '/mis/dashboard';
        default:
            return '/';
    }
}

// Check if a route belongs to a specific role
function getRouteRole(pathname: string): string | null {
    for (const [role, routes] of Object.entries(roleRoutes)) {
        if (routes.some(route => pathname.startsWith(route))) {
            return role;
        }
    }
    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if accessing a protected route or auth route
    const isProtectedRoute = allProtectedRoutes.some(route => pathname.startsWith(route));
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
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // For authenticated users on protected routes, verify role
    if (isProtectedRoute && user) {
        // Get user role from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, status')
            .eq('id', user.id)
            .single();

        // If user data couldn't be fetched, redirect to login
        if (userError || !userData) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Check if account is active
        if (userData.status !== 'active') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'account_inactive');
            return NextResponse.redirect(loginUrl);
        }

        // Check role authorization
        const requiredRole = getRouteRole(pathname);
        if (requiredRole && userData.role !== requiredRole) {
            // Redirect to their correct dashboard
            return NextResponse.redirect(new URL(getDashboardForRole(userData.role), request.url));
        }

        // Additional check for candidates: verify approval status
        if (userData.role === 'candidate' && requiredRole === 'candidate') {
            const { data: candidateData } = await supabase
                .from('candidates')
                .select('approval_status, profile_completed')
                .eq('user_id', user.id)
                .single();

            // Only restrict if profile is completed but not approved
            if (candidateData?.profile_completed && candidateData.approval_status !== 'approved') {
                // Allow access to dashboard and profile routes
                const allowedRoutes = ['/candidate/dashboard', '/candidate/profile', '/candidate/create-profile'];
                const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

                if (!isAllowedRoute) {
                    // Redirect to dashboard with info message
                    const dashboardUrl = new URL('/candidate/dashboard', request.url);
                    dashboardUrl.searchParams.set('info', 'approval_pending');
                    return NextResponse.redirect(dashboardUrl);
                }
            }
        }

        // Additional check for employers: verify company approval status
        if (userData.role === 'employer' && requiredRole === 'employer') {
            const { data: employerData } = await supabase
                .from('employers')
                .select(`
                    id,
                    companies!inner (
                        approval_status,
                        profile_completed
                    )
                `)
                .eq('user_id', user.id)
                .single();

            // Type assertion for nested company data
            const company = (employerData as any)?.companies;

            // Only restrict if company profile is completed but not approved
            if (company?.profile_completed && company.approval_status !== 'approved') {
                // Allow access to dashboard, company profile, and personal profile routes
                const allowedRoutes = ['/employer/dashboard', '/employer/company', '/employer/profile'];
                const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

                if (!isAllowedRoute) {
                    // Redirect to dashboard with info message
                    const dashboardUrl = new URL('/employer/dashboard', request.url);
                    dashboardUrl.searchParams.set('info', 'approval_pending');
                    return NextResponse.redirect(dashboardUrl);
                }
            }
        }
    }

    // Redirect authenticated users away from auth routes
    if (isAuthRoute && user) {
        // Get user role to redirect to correct dashboard
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const dashboard = userData?.role ? getDashboardForRole(userData.role) : '/candidate/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    return response;
}

export const config = {
    matcher: [
        // Candidate routes
        '/candidate/dashboard/:path*',
        '/candidate/profile/:path*',
        '/candidate/applications/:path*',
        '/candidate/settings/:path*',
        '/candidate/jobs/:path*',
        '/candidate/create-profile/:path*',
        // Employer routes
        '/employer/dashboard/:path*',
        '/employer/jobs/:path*',
        '/employer/applications/:path*',
        '/employer/candidates/:path*',
        '/employer/company/:path*',
        '/employer/profile/:path*',
        '/employer/admins/:path*',
        '/employer/settings/:path*',
        // MIS routes
        '/mis/dashboard/:path*',
        '/mis/users/:path*',
        '/mis/candidates/:path*',
        '/mis/employers/:path*',
        '/mis/jobs/:path*',
        '/mis/settings/:path*',
        // Auth routes
        '/login',
        '/candidate/login',
        '/candidate/signup',
        '/employer/login',
        '/employer/signup',
        '/mis/login',
        '/mis/register',
    ],
};
