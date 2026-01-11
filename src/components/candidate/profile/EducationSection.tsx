import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { GraduationCap, Award as AwardIcon, Building } from "lucide-react";

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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
                    {academic.length > 0 ? academic.map((edu, index) => (
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
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No academic education added</p>
                    )}
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                    {professional.length > 0 ? professional.map((edu, index) => (
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
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No professional qualifications added</p>
                    )}
                </TabsContent>
            </Tabs>
        );
    };

    // Finance industry education
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

    // Banking industry education
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
                                    <div className="flex items-center gap-2 mt-2">
                                        {training.certificate_issue_month && (
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(training.certificate_issue_month)}
                                            </span>
                                        )}
                                        <Badge variant="outline" className={`text-xs ${getStatusColor(training.status)}`}>
                                            {formatStatus(training.status)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                </CardTitle>
            </CardHeader>
            <CardContent>
                {industry.toLowerCase().includes("finance") && (financeAcademic.length > 0 || financeProfessional.length > 0) ? (
                    renderFinanceEducation()
                ) : industry.toLowerCase().includes("banking") && (bankingAcademic.length > 0 || bankingProfessional.length > 0 || bankingTraining.length > 0) ? (
                    renderBankingEducation()
                ) : (
                    renderGeneralEducation()
                )}
            </CardContent>
        </Card>
    );
}
