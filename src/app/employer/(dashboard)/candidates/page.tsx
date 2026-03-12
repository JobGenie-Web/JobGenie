import { Metadata } from "next";
import { EmployerLayout } from "@/components/employer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CandidateTable } from "./CandidateTable";

export const metadata: Metadata = {
    title: "Browse Candidates | JobGenie",
    description: "Browse and filter approved candidate profiles",
};

interface CandidateForTable {
    id: string;
    first_name: string;
    last_name: string;
    industry: string;
    current_position: string;
    years_of_experience: number | null;
    experience_level: string | null;
    employment_type: string | null;
    availability_status: string | null;
    qualifications: string[];
    expected_positions: string[];  // Positions the candidate is targeting
    invited: boolean;  // NEW: Track if candidate has been invited
}

async function getApprovedCandidates() {
    const supabase = await createClient();

    // Fetch only MIS approved candidates
    const { data: candidates, error } = await supabase
        .from('candidates')
        .select('id, first_name, last_name, industry, current_position, years_of_experience, experience_level, employment_type, availability_status, qualifications, expected_positions')
        .eq('approval_status', 'approved')
        .eq('profile_completed', true)
        .order('years_of_experience', { ascending: false });

    if (error) {
        console.error('Error fetching candidates:', error);
        return [];
    }

    return candidates as CandidateForTable[];
}

export default async function EmployerCandidatesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/employer/login");
    }

    // Get employer ID
    const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    // Fetch approved candidates
    const candidates = await getApprovedCandidates();

    // Fetch invitation statuses for this employer (exclude canceled invitations)
    const { data: invitations } = await supabase
        .from('job_invitations')
        .select('candidate_id')
        .eq('employer_id', employer?.id || '')
        .eq('invitation_canceled', false);  // Only active invitations

    // Add invitation status to candidates
    const invitedCandidateIds = new Set(invitations?.map(inv => inv.candidate_id) || []);
    const candidatesWithStatus = candidates.map(candidate => ({
        ...candidate,
        invited: invitedCandidateIds.has(candidate.id)
    }));

    // Fetch industries from the database table
    const { data: industriesData, error: industriesError } = await supabase
        .from('industries')
        .select('industry_id, industry_name')
        .order('industry_name', { ascending: true });

    if (industriesError) {
        console.error('Error fetching industries:', industriesError);
    }

    const industries = industriesData || [];

    return (
        <EmployerLayout
            pageTitle="Browse Candidates"
            pageDescription="Filter and view approved candidate profiles"
        >
            <CandidateTable
                candidates={candidatesWithStatus}
                industries={industries}
            />
        </EmployerLayout>
    );
}
