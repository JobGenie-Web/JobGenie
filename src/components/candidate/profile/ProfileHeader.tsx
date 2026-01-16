"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Briefcase, Calendar, FileText, Pencil, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CandidateProfile } from "@/types/profile-types";
import { BasicInfoDialog } from "./dialogs/BasicInfoDialog";

interface ProfileHeaderProps {
    profile: CandidateProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

    const getAvailabilityColor = (status: string | null) => {
        switch (status) {
            case "available":
                return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800";
            case "open_to_opportunities":
                return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800";
            case "not_looking":
                return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800";
            default:
                return "";
        }
    };

    const formatAvailabilityStatus = (status: string | null) => {
        if (!status) return null;
        return status.split("_").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
    };

    return (
        <>
            <Card className="overflow-hidden group relative">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />

                {/* Edit Button - visible on hover on desktop, always visible on mobile */}
                <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 shadow-lg"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>

                {/* Profile Content */}
                <div className="px-6 pb-6">
                    {/* Avatar - Overlapping cover */}
                    <div className="flex items-start justify-between -mt-16 mb-4">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                            <AvatarImage src={profile.profile_image_url || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
                            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        {profile.availability_status && (
                            <Badge
                                variant="outline"
                                className={`mt-16 ${getAvailabilityColor(profile.availability_status)}`}
                            >
                                {formatAvailabilityStatus(profile.availability_status)}
                            </Badge>
                        )}
                    </div>

                    {/* Name and Position */}
                    <div className="space-y-2 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {profile.first_name} {profile.last_name}
                            </h1>
                            {profile.membership_no && (
                                <p className="text-sm text-muted-foreground font-mono mt-1">
                                    Member: {profile.membership_no}
                                </p>
                            )}
                        </div>
                        <p className="text-lg text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {profile.current_position}
                        </p>

                        {profile.resume_url && (
                            <div className="mt-3">
                                <Button variant="default" size="sm" className="h-8 gap-2 bg-green-500" asChild>
                                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-3.5 w-3.5" />
                                        View Resume
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{profile.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span>{profile.nicPassport}</span>
                        </div>
                        {profile.country && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>{profile.country}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{profile.industry}</span>
                        </div>
                        {profile.highest_qualification && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                                <span className="capitalize">{profile.highest_qualification.replace(/_/g, ' ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Edit Dialog */}
            <BasicInfoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                profile={profile}
            />
        </>
    );
}
