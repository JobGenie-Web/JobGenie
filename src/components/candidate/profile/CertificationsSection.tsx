"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Certificate } from "@/types/profile-types";
import { Award, Calendar, ExternalLink, Hash, ChevronDown, ChevronUp } from "lucide-react";

interface CertificationsSectionProps {
    certificates: Certificate[];
}

export function CertificationsSection({ certificates }: CertificationsSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    if (!certificates || certificates.length === 0) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    const isExpired = (expiryDate: string | null) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const toggleDescription = (id: string) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const displayedCertificates = showAll ? certificates : certificates.slice(0, 3);
    const hasMore = certificates.length > 3;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {displayedCertificates.map((cert, index) => (
                        <div key={cert.id}>
                            {index > 0 && <Separator className="my-6" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Award className="h-6 w-6 text-primary" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {cert.certificate_name || "Certification"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {cert.issuing_authority || "Issuing Authority"}
                                        </p>
                                    </div>

                                    {/* Date Information */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        {cert.issue_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Issued {formatDate(cert.issue_date)}</span>
                                            </div>
                                        )}
                                        {cert.expiry_date && (
                                            <Badge
                                                variant={isExpired(cert.expiry_date) ? "destructive" : "secondary"}
                                                className="text-xs"
                                            >
                                                {isExpired(cert.expiry_date) ? "Expired" : "Expires"} {formatDate(cert.expiry_date)}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Credential Information */}
                                    {(cert.credential_id || cert.credential_url) && (
                                        <div className="flex flex-wrap items-center gap-3 pt-1">
                                            {cert.credential_id && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Hash className="h-3 w-3" />
                                                    <span className="font-mono">{cert.credential_id}</span>
                                                </div>
                                            )}
                                            {cert.credential_url && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs"
                                                    asChild
                                                >
                                                    <a
                                                        href={cert.credential_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        View Credential
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Description with Read More */}
                                    {cert.description && (
                                        <div className="pt-1">
                                            <p
                                                className={`text-sm text-muted-foreground leading-relaxed ${!expandedDescriptions[cert.id] ? 'line-clamp-2' : ''
                                                    }`}
                                            >
                                                {cert.description}
                                            </p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => toggleDescription(cert.id)}
                                                className="px-0 h-auto mt-1 text-xs"
                                            >
                                                {expandedDescriptions[cert.id] ? (
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
                                    View All Certifications ({certificates.length})
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
