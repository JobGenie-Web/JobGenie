// @ts-nocheck - Suppress react-hook-form type definition conflicts
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { basicInfoSchema, type BasicInfoFormData } from "@/lib/validations/profile";
import { updateBasicInfo } from "@/app/actions/profile-mutations";
import { useToast } from "@/hooks/use-toast";
import { CandidateProfile } from "@/types/profile-types";
import { Upload, Loader2 } from "lucide-react";

interface BasicInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: CandidateProfile;
}

export function BasicInfoDialog({ open, onOpenChange, profile }: BasicInfoDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<BasicInfoFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            nicPassport: "",
            phone: "",
            alternative_phone: "",
            country: "",
            current_position: "",
            profile_image_url: "",
        },
    });

    // Reset form when dialog opens with profile data
    useEffect(() => {
        if (open && profile) {
            form.reset({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                nicPassport: profile.nicPassport || "",
                phone: profile.phone || "",
                alternative_phone: profile.alternative_phone || "",
                country: profile.country || "",
                current_position: profile.current_position || "",
                profile_image_url: profile.profile_image_url || "",
            });
            setPreviewImage(profile.profile_image_url);
        }
    }, [open, profile, form]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (JPEG, PNG, GIF, or WebP)",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/candidate/upload-profile-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to upload image");
            }

            // Update form with new image URL
            form.setValue("profile_image_url", data.data.url);

            toast({
                title: "Success",
                description: "Profile picture uploaded successfully",
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive",
            });
            // Revert preview
            setPreviewImage(profile.profile_image_url);
        } finally {
            setIsUploading(false);
        }
    };

    async function onSubmit(data: BasicInfoFormData) {
        setIsSubmitting(true);
        try {
            // Clean up optional fields
            const formattedData = {
                ...data,
                alternative_phone: data.alternative_phone && data.alternative_phone.trim() !== ""
                    ? data.alternative_phone
                    : undefined,
                country: data.country && data.country.trim() !== ""
                    ? data.country
                    : undefined,
            };

            const result = await updateBasicInfo(formattedData);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Basic information updated successfully",
                });
                onOpenChange(false);
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Something went wrong",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating basic info:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Basic Information</DialogTitle>
                    <DialogDescription>
                        Update your basic information and profile picture
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                <AvatarImage src={previewImage || undefined} alt="Profile picture" />
                                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isSubmitting}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Change Profile Picture
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG, GIF or WebP. Max 5MB.
                                </p>
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* NIC/Passport and Phone Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nicPassport"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NIC/Passport *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 199012345678 or N1234567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+94 XX XXX XXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="alternative_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alternative Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+94 XX XXX XXXX (Optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="current_position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Position *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Software Engineer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Sri Lanka" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting || isUploading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || isUploading}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
