import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();

    // Sign out from Supabase - this clears the session
    const { error } = await supabase.auth.signOut();

    if (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to sign out' },
            { status: 500 }
        );
    }

    // Return success - client should handle redirect
    return NextResponse.json({
        success: true,
        message: 'Signed out successfully',
        redirectTo: '/login',
    });
}

