import { useState, useEffect } from "react";

export interface JobDesignation {
    designation_id: number;
    designation_name: string;
    industry_id: number;
    level_id: number;
    industries: {
        industry_id: number;
        industry_name: string;
    };
    seniority_levels: {
        level_id: number;
        level_name: string;
        level_order: number;
    };
}

interface UseJobDesignationsReturn {
    jobDesignations: JobDesignation[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useJobDesignations(industryId?: number | null): UseJobDesignationsReturn {
    const [jobDesignations, setJobDesignations] = useState<JobDesignation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobDesignations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build URL with optional industry filter
            const url = industryId
                ? `/api/job-designations?industryId=${industryId}`
                : "/api/job-designations";

            const response = await fetch(url);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to fetch job designations");
            }

            setJobDesignations(result.data);
        } catch (err) {
            console.error("Error fetching job designations:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDesignations();
    }, [industryId]);

    return { jobDesignations, loading, error, refetch: fetchJobDesignations };
}
