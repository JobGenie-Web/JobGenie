"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkExperience } from "@/types/profile-types";
import { Briefcase, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface ExperienceSectionProps {
    experiences: WorkExperience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    if (!experiences || experiences.length === 0) {
        return null;
    }

    // Group experiences by company
    const groupedByCompany = experiences.reduce((acc, exp) => {
        const company = exp.company || "Unknown Company";
        if (!acc[company]) {
            acc[company] = [];
        }
        acc[company].push(exp);
        return acc;
    }, {} as Record<string, WorkExperience[]>);

    // Sort each company's experiences by start date (newest first)
    Object.keys(groupedByCompany).forEach(company => {
        groupedByCompany[company].sort((a, b) => {
            const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
            const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
            return dateB - dateA;
        });
    });

    const companies = Object.keys(groupedByCompany);
    const displayedCompanies = showAll ? companies : companies.slice(0, 3);
    const hasMore = companies.length > 3;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    const formatEmploymentType = (type: string | null) => {
        if (!type) return null;
        return type.split("_").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
    };

    const formatLocationType = (type: string | null) => {
        if (!type) return null;
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const toggleDescription = (id: string) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const isTruncated = (text: string) => {
        const lines = text.split('\n');
        return lines.length > 2 || text.length > 200;
    };

    const getTruncatedText = (text: string) => {
        const lines = text.split('\n');
        if (lines.length > 2) {
            return lines.slice(0, 2).join('\n');
        }
        if (text.length > 200) {
            return text.substring(0, 200) + '...';
        }
        return text;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {displayedCompanies.map((company, companyIndex) => (
                        <div key={company}>
                            {companyIndex > 0 && <Separator className="my-8" />}

                            {/* Company Header */}
                            <div className="mb-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Briefcase className="h-7 w-7 text-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{company}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {groupedByCompany[company].length} {groupedByCompany[company].length === 1 ? 'position' : 'positions'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Positions at this company */}
                            <div className="space-y-6 ml-[72px]">
                                {groupedByCompany[company].map((exp, posIndex) => (
                                    <div key={exp.id}>
                                        {posIndex > 0 && <Separator className="my-6" />}

                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                {exp.job_title || "Position"}
                                            </h4>

                                            {/* Date and Type Info */}
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        {formatDate(exp.start_date)} - {" "}
                                                        {exp.is_current ? (
                                                            <span className="text-primary font-medium">Present</span>
                                                        ) : (
                                                            formatDate(exp.end_date)
                                                        )}
                                                    </span>
                                                </div>

                                                {exp.employment_type && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {formatEmploymentType(exp.employment_type)}
                                                    </Badge>
                                                )}

                                                {exp.location_type && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {formatLocationType(exp.location_type)}
                                                    </Badge>
                                                )}
                                            </div>

                                            {exp.location && (
                                                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span>{exp.location}</span>
                                                </div>
                                            )}

                                            {/* Description with Read More */}
                                            {exp.description && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                                        {expandedDescriptions[exp.id]
                                                            ? exp.description
                                                            : getTruncatedText(exp.description)
                                                        }
                                                    </p>
                                                    {isTruncated(exp.description) && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => toggleDescription(exp.id)}
                                                            className="px-0 h-auto mt-1 text-xs"
                                                        >
                                                            {expandedDescriptions[exp.id] ? (
                                                                <>
                                                                    {/* <ChevronUp className="h-3 w-3 mr-1" /> */}
                                                                    Read Less
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* <ChevronDown className="h-3 w-3 mr-1" /> */}
                                                                    Read More
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {hasMore && (
                    <div className="mt-6 text-center">
                        <Button
                            variant="outline"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full md:w-auto"
                        >
                            {showAll ? (
                                <>
                                    {/* <ChevronUp className="h-4 w-4 mr-2" /> */}
                                    Show Less
                                </>
                            ) : (
                                <>
                                    {/* <ChevronDown className="h-4 w-4 mr-2" /> */}
                                    View All Companies ({companies.length})
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
