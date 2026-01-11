"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Education,
    FinanceAcademicEducation,
    FinanceProfessionalEducation,
    BankingAcademicEducation,
    BankingProfessionalEducation,
    BankingSpecializedTraining
} from "@/types/profile-types";
import { GraduationCap, Award as AwardIcon, Building, Pencil, Trash2, Plus } from "lucide-react";
import { EducationDialog } from "./dialogs/EducationDialog";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { deleteEducation } from "@/app/actions/profile-mutations";
import { useToast } from "@/hooks/use-toast";

interface EducationSectionProps {
    educations: Education[];
    financeAcademic: FinanceAcademicEducation[];
    financeProfessional: FinanceProfessionalEducation[];
    bankingAcademic: BankingAcademicEducation[];
    bankingProfessional: BankingProfessionalEducation[];
    bankingTraining: BankingSpecializedTraining[];
    industry: string;
}

export function EducationSection({
    educations,
    financeAcademic,
    financeProfessional,
    bankingAcademic,
    bankingProfessional,
    bankingTraining,
    industry
}: EducationSectionProps) {
    const router = useRouter();
    const { toast } = useToast();

    // Dialog states for General Education  
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
    const [educationType, setEducationType] = useState<"academic" | "professional">("academic");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [eduToDelete, setEduToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasAnyEducation = educations.length > 0 ||
        financeAcademic.length > 0 ||
        financeProfessional.length > 0 ||
        bankingAcademic.length > 0 ||
        bankingProfessional.length > 0 ||
        bankingTraining.length > 0;

    if (!hasAnyEducation) {
        return null;
    }

    const formatStatus = (status: string) => {
        return status.split("_").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
    };

    const getStatusColor = (status: string) => {
        if (status === "first_class") {
            return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400";
        }
        if (status.includes("second_class")) {
            return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400";
        }
        return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400";
    };

    const handleEdit = (edu: Education) => {
        setSelectedEducation(edu);
        setEducationType(edu.education_type as "academic" | "professional");
        setDialogOpen(true);
    };

    const handleAdd = (type: "academic" | "professional") => {
        setSelectedEducation(null);
        setEducationType(type);
        setDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setEduToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eduToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteEducation(eduToDelete);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Education deleted successfully",
                });
                setDeleteDialogOpen(false);
                setEduToDelete(null);
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete education",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // General education component
    const renderGeneralEducation = () => {
        if (educations.length === 0) return null;

        const academic = educations.filter(e => e.education_type === "academic");
        const professional = educations.filter(e => e.education_type === "professional");

        return (
            <Tabs defaultValue="academic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="space-y-4 mt-4">
                    <div className="flex justify-end mb-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdd("academic")}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Academic Education
                        </Button>
                    </div>
                    {academic.length > 0 ? academic.map((edu, index) => (
                        <div key={edu.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="group relative flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>
                                </div>

                                {/* Edit/Delete buttons */}
                                <div className="absolute -right-2 -top-2 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(edu)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteClick(edu.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 pr-16 md:pr-0">
                                    <h3 className="font-semibold">{edu.degree_diploma}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <Badge variant="outline" className={`mt-2 text-xs ${getStatusColor(edu.status)}`}>
                                        {formatStatus(edu.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No academic education added</p>
                    )}
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                    <div className="flex justify-end mb-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdd("professional")}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Professional Qualification
                        </Button>
                    </div>
                    {professional.length > 0 ? professional.map((edu, index) => (
                        <div key={edu.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="group relative flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <AwardIcon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>

                                {/* Edit/Delete buttons */}
                                <div className="absolute -right-2 -top-2 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(edu)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteClick(edu.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 pr-16 md:pr-0">
                                    <h3 className="font-semibold">{edu.professional_qualification}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <Badge variant="outline" className={`mt-2 text-xs ${getStatusColor(edu.status)}`}>
                                        {formatStatus(edu.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No professional qualifications added</p>
                    )}
                </TabsContent>
            </Tabs>
        );
    };

    // Finance industry education (view only for now)
    const renderFinanceEducation = () => {
        if (financeAcademic.length === 0 && financeProfessional.length === 0) return null;

        return (
            <Tabs defaultValue="academic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="space-y-4 mt-4">
                    {financeAcademic.map((edu, index) => (
                        <div key={edu.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{edu.degree_diploma}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <Badge variant="outline" className={`mt-2 text-xs ${getStatusColor(edu.status)}`}>
                                        {formatStatus(edu.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                    {financeProfessional.map((edu, index) => (
                        <div key={edu.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <AwardIcon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{edu.professional_qualification}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <Badge variant="outline" className={`mt-2 text-xs ${getStatusColor(edu.status)}`}>
                                        {formatStatus(edu.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        );
    };

    // Banking industry education (view only for now)
    const renderBankingEducation = () => {
        if (bankingAcademic.length === 0 && bankingProfessional.length === 0 && bankingTraining.length === 0) return null;

        return (
            <Tabs defaultValue="academic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="space-y-4 mt-4">
                    {bankingAcademic.map((edu, index) => (
                        <div key={edu.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{edu.degree_diploma}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <Badge variant="outline" className={`mt-2 text-xs ${getStatusColor(edu.status)}`}>
                                        {formatStatus(edu.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                    {bankingProfessional.map((edu, index) => (
                        <div key={edu.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <AwardIcon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{edu.professional_qualification}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <Badge variant="outline" className={`mt-2 text-xs ${getStatusColor(edu.status)}`}>
                                        {formatStatus(edu.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                <TabsContent value="training" className="space-y-4 mt-4">
                    {bankingTraining.map((training, index) => (
                        <div key={training.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{training.certificate_name}</h3>
                                    <p className="text-sm text-muted-foreground">{training.issuing_authority}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        );
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {industry.toLowerCase().includes("it") && educations.length > 0 && renderGeneralEducation()}
                    {industry.toLowerCase().includes("finance") && (financeAcademic.length > 0 || financeProfessional.length > 0) && renderFinanceEducation()}
                    {industry.toLowerCase().includes("banking") && (bankingAcademic.length > 0 || bankingProfessional.length > 0 || bankingTraining.length > 0) && renderBankingEducation()}
                </CardContent>
            </Card>

            {/* Dialogs - Only for General Education */}
            <EducationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                education={selectedEducation}
                educationType={educationType}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Education"
                description="Are you sure you want to delete this education entry? This action cannot be undone."
                isLoading={isDeleting}
            />
        </>
    );
}
