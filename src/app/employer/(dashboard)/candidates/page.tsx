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
    industry: string;
    current_position: string;
    years_of_experience: number | null;
    experience_level: string | null;
    employment_type: string | null;
    availability_status: string | null;
    qualifications: string[];
}

async function getApprovedCandidates() {
    const supabase = await createClient();

    // Fetch only MIS approved candidates
    const { data: candidates, error } = await supabase
        .from('candidates')
        .select('id, industry, current_position, years_of_experience, experience_level, employment_type, availability_status, qualifications')
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

    // Fetch approved candidates
    const candidates = await getApprovedCandidates();

    // Extract unique industries
    const industries = Array.from(
        new Set(candidates.map(c => c.industry).filter(Boolean))
    ).sort();

    // Create a map of industries to job designations
    const designationsByIndustry: Record<string, string[]> = {};
    candidates.forEach(candidate => {
        if (candidate.industry && candidate.current_position) {
            if (!designationsByIndustry[candidate.industry]) {
                designationsByIndustry[candidate.industry] = [];
            }
            if (!designationsByIndustry[candidate.industry].includes(candidate.current_position)) {
                designationsByIndustry[candidate.industry].push(candidate.current_position);
            }
        }
    });

    // Sort designations within each industry
    Object.keys(designationsByIndustry).forEach(industry => {
        designationsByIndustry[industry].sort();
    });

    return (
        <EmployerLayout
            pageTitle="Browse Candidates"
            pageDescription="Filter and view approved candidate profiles"
        >
            <CandidateTable
                candidates={candidates}
                industries={industries}
                designationsByIndustry={designationsByIndustry}
            />
        </EmployerLayout>
    );
}
