"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Building2, Globe, MapPin, Phone, FileText, Users, MapPinned, Pencil } from "lucide-react";
import { CompanyProfile } from "@/app/actions/employer-profiles";
import { CompanyInfoDialog } from "@/components/employer/dialogs/CompanyInfoDialog";

interface CompanyProfileClientProps {
    company: CompanyProfile;
    userId: string;
}

export function CompanyProfileClient({ company, userId }: CompanyProfileClientProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const companyInitials = company.company_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <>
            <div className="space-y-6 max-w-4xl">
                {/* Company Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Company Logo */}
                            <Avatar className="h-24 w-24 border-4 border-border rounded-lg">
                                <AvatarImage
                                    src={company.logo_url || undefined}
                                    alt={company.company_name}
                                    className="object-contain p-2"
                                />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary rounded-lg">
                                    {companyInitials}
                                </AvatarFallback>
                            </Avatar>

                            {/* Basic Info */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h2 className="text-2xl font-bold">{company.company_name}</h2>
                                    <p className="text-muted-foreground">{company.industry}</p>
                                    {company.bio && (
                                        <p className="text-sm text-muted-foreground italic mt-1">"{company.bio}"</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {company.company_size && (
                                        <Badge variant="secondary">
                                            <Users className="h-3 w-3 mr-1" />
                                            {company.company_size} employees
                                        </Badge>
                                    )}
                                    <Badge
                                        variant={
                                            company.approval_status === "approved"
                                                ? "default"
                                                : company.approval_status === "pending"
                                                    ? "outline"
                                                    : "destructive"
                                        }
                                    >
                                        {company.approval_status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditDialogOpen(true)}
                                className="shrink-0"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* About the Company - Moved to bottom */}
                {company.description && (
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-4">About the Company</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {company.description}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Company Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Contact Information */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{company.phone}</p>
                                </div>
                            </div>

                            {company.website && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-muted-foreground">Website</p>
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline truncate block"
                                            >
                                                {company.website}
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Business Information */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-lg mb-4">Business Information</h3>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Registration Number</p>
                                    <p className="font-medium font-mono">{company.business_registration_no}</p>
                                </div>
                            </div>

                            <Separator />
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Industry</p>
                                    <p className="font-medium">{company.industry}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Locations */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold text-lg mb-4">Locations</h3>
                        <div className="flex items-start gap-3">
                            <MapPinned className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Registered Address</p>
                                <p className="font-medium">{company.business_registered_address}</p>
                            </div>
                        </div>

                        {company.headoffice_location && (
                            <>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Head Office Location</p>
                                        <p className="font-medium">{company.headoffice_location}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Company Specialities */}
                {company.specialities && company.specialities.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-4">Company Specialities</h3>
                            <div className="flex flex-wrap gap-2">
                                {company.specialities.map((speciality, index) => (
                                    <Badge key={index} variant="secondary" className="text-sm">
                                        {speciality}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Map Link */}
                {company.map_link && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Location Map</h3>
                                    <a
                                        href={company.map_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        View Larger Map
                                    </a>
                                </div>
                                <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                                    <iframe
                                        src={company.map_link}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Company Location Map"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit Dialog */}
            <CompanyInfoDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                company={company}
                userId={userId}
            />
        </>
    );
}
