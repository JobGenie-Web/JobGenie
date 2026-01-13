import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerLayout } from "@/components/employer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Globe, MapPin, Phone, FileText, Users, MapPinned } from "lucide-react";
import { getCompanyProfile } from "@/app/actions/employer-profiles";

export const metadata: Metadata = {
    title: "Company Profile | JobGenie",
    description: "View your company information",
};

export default async function CompanyProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const companyProfile = await getCompanyProfile(user.id);

    if (!companyProfile) {
        redirect("/employer/dashboard");
    }

    const companyInitials = companyProfile.company_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <EmployerLayout
            pageTitle="Company Profile"
            pageDescription="View and manage your company information"
        >
            <div className="space-y-6 max-w-4xl">
                {/* Company Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Company Logo */}
                            <Avatar className="h-24 w-24 border-4 border-border rounded-lg">
                                <AvatarImage
                                    src={companyProfile.logo_url || undefined}
                                    alt={companyProfile.company_name}
                                    className="object-contain p-2"
                                />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary rounded-lg">
                                    {companyInitials}
                                </AvatarFallback>
                            </Avatar>

                            {/* Basic Info */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h2 className="text-2xl font-bold">{companyProfile.company_name}</h2>
                                    <p className="text-muted-foreground">{companyProfile.industry}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {companyProfile.company_size && (
                                        <Badge variant="secondary">
                                            <Users className="h-3 w-3 mr-1" />
                                            {companyProfile.company_size} employees
                                        </Badge>
                                    )}
                                    <Badge
                                        variant={
                                            companyProfile.approval_status === "approved"
                                                ? "default"
                                                : companyProfile.approval_status === "pending"
                                                    ? "outline"
                                                    : "destructive"
                                        }
                                    >
                                        {companyProfile.approval_status}
                                    </Badge>
                                </div>

                                {companyProfile.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {companyProfile.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Company Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{companyProfile.phone}</p>
                                </div>
                            </div>

                            {companyProfile.website && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-muted-foreground">Website</p>
                                            <a
                                                href={companyProfile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline truncate block"
                                            >
                                                {companyProfile.website}
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Business Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Registration Number</p>
                                    <p className="font-medium font-mono">{companyProfile.business_registration_no}</p>
                                </div>
                            </div>

                            <Separator />
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Industry</p>
                                    <p className="font-medium">{companyProfile.industry}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Locations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Locations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPinned className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Registered Address</p>
                                <p className="font-medium">{companyProfile.business_registered_address}</p>
                            </div>
                        </div>

                        {companyProfile.headoffice_location && (
                            <>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Head Office Location</p>
                                        <p className="font-medium">{companyProfile.headoffice_location}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Company Description */}
                {companyProfile.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle>About the Company</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {companyProfile.description}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </EmployerLayout>
    );
}
