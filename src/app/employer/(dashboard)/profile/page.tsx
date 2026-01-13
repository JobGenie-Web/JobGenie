import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerLayout } from "@/components/employer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Briefcase, Building2, MapPin, User } from "lucide-react";
import { getEmployerProfile } from "@/app/actions/employer-profiles";

export const metadata: Metadata = {
    title: "Employer Profile | JobGenie",
    description: "View and manage your employer profile",
};

export default async function EmployerProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const employerProfile = await getEmployerProfile(user.id);

    if (!employerProfile) {
        redirect("/employer/dashboard");
    }

    const fullName = `${employerProfile.first_name} ${employerProfile.last_name}`;
    const initials = `${employerProfile.first_name[0]}${employerProfile.last_name[0]}`.toUpperCase();

    return (
        <EmployerLayout
            pageTitle="Employer Profile"
            pageDescription="View and manage your personal information"
        >
            <div className="space-y-6 max-w-4xl">
                {/* Profile Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Profile Image */}
                            <Avatar className="h-24 w-24 border-4 border-border">
                                <AvatarImage src={employerProfile.profile_image_url || undefined} alt={fullName} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            {/* Basic Info */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h2 className="text-2xl font-bold">{fullName}</h2>
                                    {employerProfile.job_title && (
                                        <p className="text-muted-foreground">{employerProfile.job_title}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {employerProfile.department && (
                                        <Badge variant="secondary">
                                            <Building2 className="h-3 w-3 mr-1" />
                                            {employerProfile.department}
                                        </Badge>
                                    )}
                                    {employerProfile.designation && (
                                        <Badge variant="outline">
                                            <User className="h-3 w-3 mr-1" />
                                            {employerProfile.designation}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email Address</p>
                                <p className="font-medium">{employerProfile.email}</p>
                            </div>
                        </div>

                        {employerProfile.phone && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone Number</p>
                                        <p className="font-medium">{employerProfile.phone}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{employerProfile.address}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Details */}
                {(employerProfile.job_title || employerProfile.department || employerProfile.designation) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {employerProfile.job_title && (
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Job Title</p>
                                        <p className="font-medium">{employerProfile.job_title}</p>
                                    </div>
                                </div>
                            )}

                            {employerProfile.department && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Department</p>
                                            <p className="font-medium">{employerProfile.department}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {employerProfile.designation && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Designation</p>
                                            <p className="font-medium">{employerProfile.designation}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </EmployerLayout>
    );
}
