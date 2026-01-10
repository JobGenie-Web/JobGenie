"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/types/profile-types";
import { FolderGit2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface ProjectsSectionProps {
    projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    if (!projects || projects.length === 0) {
        return null;
    }

    const displayedProjects = showAll ? projects : projects.slice(0, 3);
    const hasMore = projects.length > 3;

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
                    <FolderGit2 className="h-5 w-5" />
                    Projects
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {displayedProjects.map((project, index) => (
                        <div key={project.id}>
                            {index > 0 && <Separator className="my-6" />}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg">
                                            {project.project_name || "Untitled Project"}
                                        </h3>
                                        {project.is_current && (
                                            <Badge variant="default" className="mt-1">
                                                Currently Working
                                            </Badge>
                                        )}
                                    </div>

                                    {project.demo_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-shrink-0"
                                            asChild
                                        >
                                            <a
                                                href={project.demo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                View
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                {project.description && (
                                    <div>
                                        <p
                                            className={`text-sm text-muted-foreground leading-relaxed ${!expandedDescriptions[project.id] ? 'line-clamp-2' : ''
                                                }`}
                                        >
                                            {project.description}
                                        </p>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => toggleDescription(project.id)}
                                            className="px-0 h-auto mt-1 text-xs"
                                        >
                                            {expandedDescriptions[project.id] ? (
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
                                    View All Projects ({projects.length})
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
