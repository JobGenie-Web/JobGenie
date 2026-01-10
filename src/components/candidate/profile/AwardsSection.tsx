"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Award } from "@/types/profile-types";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface AwardsSectionProps {
    awards: Award[];
}

export function AwardsSection({ awards }: AwardsSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    if (!awards || awards.length === 0) {
        return null;
    }

    const displayedAwards = showAll ? awards : awards.slice(0, 3);
    const hasMore = awards.length > 3;

    const toggleDescription = (id: string) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Awards & Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {displayedAwards.map((award, index) => (
                        <div key={award.id}>
                            {index > 0 && <Separator className="my-6" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg">
                                        {award.nature_of_award || "Award"}
                                    </h3>
                                    {award.offered_by && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {award.offered_by}
                                        </p>
                                    )}
                                    {award.description && (
                                        <div className="mt-2">
                                            <p
                                                className={`text-sm text-muted-foreground leading-relaxed ${!expandedDescriptions[award.id] ? 'line-clamp-2' : ''
                                                    }`}
                                            >
                                                {award.description}
                                            </p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => toggleDescription(award.id)}
                                                className="px-0 h-auto mt-1 text-xs"
                                            >
                                                {expandedDescriptions[award.id] ? (
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
                                        </div>
                                    )}
                                </div>
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
                                    View All Awards ({awards.length})
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
