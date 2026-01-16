"use client";

import { useState } from "react";
import { Users, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CandidateDetailModal } from "./CandidateDetailModal";
import { cn } from "@/lib/utils";

interface Candidate {
    id: string;
    industry: string;
    current_position: string;
    years_of_experience: number | null;
    experience_level: string | null;
    employment_type: string | null;
    availability_status: string | null;
    qualifications: string[];
}

interface CandidateTableProps {
    candidates: Candidate[];
    industries: string[];
    designationsByIndustry: Record<string, string[]>;
}

function formatExperienceLevel(level: string | null): string {
    if (!level) return 'N/A';
    return level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ');
}

function formatEmploymentType(type: string | null): string {
    if (!type) return 'N/A';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatAvailabilityStatus(status: string | null): string {
    if (!status) return 'N/A';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getHighestQualification(qualifications: string[]): string {
    if (!qualifications || qualifications.length === 0) return 'N/A';

    // Priority order (highest to lowest)
    const priority = [
        'doctorate_phd',
        'masters_degree',
        'post_graduate',
        'bachelors_degree',
        'professional_certification',
        'undergraduate',
        'diploma',
        'certificate',
        'vocational_training',
        'no_formal_education'
    ];

    for (const qual of priority) {
        if (qualifications.includes(qual)) {
            return qual.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    }

    return qualifications[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function CandidateTable({ candidates, industries, designationsByIndustry }: CandidateTableProps) {
    const [selectedIndustry, setSelectedIndustry] = useState<string>("");
    const [selectedDesignation, setSelectedDesignation] = useState<string>("");
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

    // Get available job designations based on selected industry
    const availableDesignations = selectedIndustry
        ? (designationsByIndustry[selectedIndustry] || [])
        : [];

    // Reset job designation when industry changes
    const handleIndustryChange = (industry: string) => {
        setSelectedIndustry(industry);
        setSelectedDesignation(""); // Reset designation when industry changes
    };

    // Only filter and show candidates if both industry and designation are selected
    const filteredCandidates = (selectedIndustry && selectedDesignation)
        ? candidates.filter(candidate =>
            candidate.industry === selectedIndustry &&
            candidate.current_position === selectedDesignation
        )
        : [];

    const hasSearched = selectedIndustry !== "" && selectedDesignation !== "";

    return (
        <div className="space-y-6">
            {/* Search/Filter Section */}
            <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold mb-1">Search Candidates</h2>
                        <p className="text-sm text-muted-foreground">
                            First select an industry, then choose a job designation to find matching approved candidates
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Industry Filter */}
                        <div className="space-y-2">
                            <label htmlFor="industry-filter" className="text-sm font-medium block">
                                1. Select Industry
                            </label>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <Select value={selectedIndustry} onValueChange={handleIndustryChange}>
                                    <SelectTrigger id="industry-filter" className="w-full" suppressHydrationWarning>
                                        <SelectValue placeholder="Choose an industry..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Job Designation Filter */}
                        <div className="space-y-2">
                            <label htmlFor="designation-filter" className="text-sm font-medium block">
                                2. Select Job Designation
                            </label>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <Select
                                    value={selectedDesignation}
                                    onValueChange={setSelectedDesignation}
                                    disabled={!selectedIndustry}
                                >
                                    <SelectTrigger id="designation-filter" className="w-full" suppressHydrationWarning>
                                        <SelectValue placeholder={
                                            selectedIndustry
                                                ? "Choose a job designation..."
                                                : "Select industry first..."
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDesignations.map((designation) => (
                                            <SelectItem key={designation} value={designation}>
                                                {designation}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Clear Search Button */}
                    {(selectedIndustry || selectedDesignation) && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setSelectedIndustry("");
                                    setSelectedDesignation("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Candidates Table - Only shown after search */}
            {hasSearched && (
                <div className="rounded-lg border bg-card">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    Search Results
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} found
                            </p>
                        </div>

                        {filteredCandidates.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No candidates found with "{selectedDesignation}" designation.
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job Designation</TableHead>
                                            <TableHead>Industry</TableHead>
                                            <TableHead>Experience</TableHead>
                                            <TableHead>Level</TableHead>
                                            <TableHead>Highest Qualification</TableHead>
                                            <TableHead>Employment Type</TableHead>
                                            <TableHead>Availability</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCandidates.map((candidate) => (
                                            <TableRow
                                                key={candidate.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedCandidateId(candidate.id)}
                                            >
                                                <TableCell className="font-medium">
                                                    {candidate.current_position}
                                                </TableCell>
                                                <TableCell>{candidate.industry}</TableCell>
                                                <TableCell>
                                                    {candidate.years_of_experience !== null
                                                        ? `${candidate.years_of_experience} ${candidate.years_of_experience === 1 ? 'year' : 'years'}`
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {formatExperienceLevel(candidate.experience_level)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {getHighestQualification(candidate.qualifications)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatEmploymentType(candidate.employment_type)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            candidate.availability_status === 'available' && "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
                                                            candidate.availability_status === 'open_to_opportunities' && "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                                                            candidate.availability_status === 'not_looking' && "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                                                        )}
                                                    >
                                                        {formatAvailabilityStatus(candidate.availability_status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCandidateId(candidate.id);
                                                        }}
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        View Details
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Candidate Detail Modal */}
            {selectedCandidateId && (
                <CandidateDetailModal
                    candidateId={selectedCandidateId}
                    onClose={() => setSelectedCandidateId(null)}
                />
            )}
        </div>
    );
}
