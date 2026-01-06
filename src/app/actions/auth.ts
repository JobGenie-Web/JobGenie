"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    candidateRegistrationSchema,
    type CandidateRegistrationData,
} from "@/lib/validations/candidate-schema";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
    generateVerificationCode,
    getVerificationExpiry,
    sendVerificationEmail,
} from "@/lib/email";
import crypto from "crypto";

export type ActionState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    redirectTo?: string;
};

export async function registerCandidate(
    _prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    // Extract form data
    const rawData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        nicPassport: formData.get("nicPassport") as string,
        gender: formData.get("gender") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        address: formData.get("address") as string,
        contactNo: formData.get("contactNo") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate with Zod
    const validationResult = candidateRegistrationSchema.safeParse(rawData);

    if (!validationResult.success) {
        const errors: Record<string, string[]> = {};
        validationResult.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(issue.message);
        });

        return {
            success: false,
            message: "Validation failed. Please check your inputs.",
            errors,
        };
    }

    const data: CandidateRegistrationData = validationResult.data;

    try {
        // Create Supabase client
        const supabase = await createClient();

        // Sign up the user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    user_type: "candidate",
                },
            },
        });

        if (authError) {
            return {
                success: false,
                message: authError.message,
            };
        }

        if (!authData.user) {
            return {
                success: false,
                message: "Failed to create user account.",
            };
        }

        const now = new Date().toISOString();

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationExpiry = getVerificationExpiry();



        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // First, create entry in the users table (required for foreign key)
        // Store expiry as local ISO string for PostgreSQL timestamp without timezone
        const { error: userError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: data.email,
            password: hashedPassword,
            role: "candidate",
            status: "pending_verification",
            email_verified: false,
            email_verification_token: verificationCode,
            verification_token_expires_at: verificationExpiry.isoString,
            created_at: now,
            updated_at: now,
        });

        if (userError) {
            console.error("User table insert error:", userError);
            return {
                success: false,
                message: "Account created but user setup failed. Please contact support.",
            };
        }

        // Store additional candidate profile data
        const { error: profileError } = await supabase.from("candidates").insert({
            user_id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            nicPassport: data.nicPassport,
            gender: data.gender,
            dob: data.dateOfBirth,
            address: data.address,
            contact_no: data.contactNo,
            phone: data.contactNo,
            email: data.email,
            current_position: "",
            industry: "",
            created_at: now,
            updated_at: now,
        });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            return {
                success: false,
                message: "Account created but profile setup failed. Please contact support.",
            };
        }

        // Send verification email
        const emailResult = await sendVerificationEmail(
            data.email,
            verificationCode,
            data.firstName
        );

        if (!emailResult.success) {
            console.error("Failed to send verification email");
            // Don't fail registration, just log the error
        }

        // Success - return redirect URL for verify-email page
        return {
            success: true,
            message: "Account created successfully! Please check your email for the verification code.",
            redirectTo: `/candidate/verify-email?email=${encodeURIComponent(data.email)}`,
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}

export async function verifyEmail(
    _prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;

    if (!email || !code) {
        return {
            success: false,
            message: "Email and verification code are required.",
        };
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
        return {
            success: false,
            message: "Please enter a valid 6-digit verification code.",
        };
    }

    try {
        // Use admin client to bypass RLS for verification operations
        const adminClient = createAdminClient();

        // Find user by email
        const { data: user, error: findError } = await adminClient
            .from("users")
            .select("id, email_verification_token, verification_token_expires_at, email_verified")
            .eq("email", email)
            .single();

        if (findError || !user) {
            return {
                success: false,
                message: "User not found. Please register again.",
            };
        }

        if (user.email_verified) {
            return {
                success: true,
                message: "Email already verified. You can log in.",
                redirectTo: "/login",
            };
        }

        // Check if code matches using timing-safe comparison
        const storedToken = user.email_verification_token || '';
        const isCodeValid = storedToken.length === code.length &&
            crypto.timingSafeEqual(Buffer.from(storedToken), Buffer.from(code));

        if (!isCodeValid) {
            return {
                success: false,
                message: "Invalid verification code. Please try again.",
            };
        }

        // Check if code is expired
        // Parse the stored timestamp and compare with current time
        // The timestamp is stored as local time (no 'Z' suffix)
        const storedExpiry = user.verification_token_expires_at;
        const expiresAtDate = new Date(storedExpiry);
        const nowDate = new Date();

        // Format current time as local ISO string for comparison
        const nowLocalString = nowDate.getFullYear() + '-' +
            String(nowDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(nowDate.getDate()).padStart(2, '0') + 'T' +
            String(nowDate.getHours()).padStart(2, '0') + ':' +
            String(nowDate.getMinutes()).padStart(2, '0') + ':' +
            String(nowDate.getSeconds()).padStart(2, '0');



        // Compare as strings - this works because ISO format is chronologically sortable
        if (storedExpiry < nowLocalString) {
            return {
                success: false,
                message: "Verification code has expired. Please request a new one.",
            };
        }

        // Update user as verified
        const { error: updateError } = await adminClient
            .from("users")
            .update({
                email_verified: true,
                status: "active",
                email_verification_token: null,
                verification_token_expires_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) {
            console.error("Verification update error:", updateError);
            return {
                success: false,
                message: "Failed to verify email. Please try again.",
            };
        }

        // Sign out the user to ensure they go to login page
        // This prevents middleware from redirecting authenticated users to dashboard
        const supabase = await createClient();
        await supabase.auth.signOut();

        return {
            success: true,
            message: "Email verified successfully! You can now log in.",
            redirectTo: "/login",
        };
    } catch (error) {
        console.error("Verification error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}

export async function resendVerificationCode(
    email: string
): Promise<ActionState> {
    if (!email) {
        return {
            success: false,
            message: "Email is required.",
        };
    }

    try {
        // Use admin client to bypass RLS for verification operations
        const adminClient = createAdminClient();

        // Find user by email
        const { data: user, error: findError } = await adminClient
            .from("users")
            .select("id, email_verified")
            .eq("email", email)
            .single();

        if (findError || !user) {
            return {
                success: false,
                message: "User not found.",
            };
        }

        if (user.email_verified) {
            return {
                success: true,
                message: "Email already verified.",
            };
        }

        // Generate new code
        const verificationCode = generateVerificationCode();
        const verificationExpiry = getVerificationExpiry();



        // Update user with new code
        const { error: updateError } = await adminClient
            .from("users")
            .update({
                email_verification_token: verificationCode,
                verification_token_expires_at: verificationExpiry.isoString,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) {
            console.error("Resend code update error:", updateError);
            return {
                success: false,
                message: "Failed to generate new code. Please try again.",
            };
        }

        // Get user's first name for email
        const { data: candidate } = await adminClient
            .from("candidates")
            .select("first_name")
            .eq("user_id", user.id)
            .single();

        // Send new verification email
        await sendVerificationEmail(
            email,
            verificationCode,
            candidate?.first_name || "User"
        );

        return {
            success: true,
            message: "New verification code sent! Please check your email.",
        };
    } catch (error) {
        console.error("Resend verification error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}

export async function loginCandidate(
    _prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email || !password) {
        return {
            success: false,
            message: "Email and password are required.",
        };
    }

    try {
        // Use admin client to check user status (bypasses RLS)
        // This is needed because RLS policies block queries before authentication
        const adminClient = createAdminClient();
        const supabase = await createClient();

        // First check if user exists and is a candidate with verified email
        const { data: userData, error: userError } = await adminClient
            .from("users")
            .select("role, status, email_verified")
            .eq("email", email)
            .single();

        if (userError || !userData) {
            return {
                success: false,
                message: "Invalid email or password.",
            };
        }

        // Check if user is a candidate
        if (userData.role !== "candidate") {
            return {
                success: false,
                message: "Invalid email or password.",
            };
        }

        // Check email verification status
        if (!userData.email_verified) {
            return {
                success: false,
                message: "Please verify your email before logging in.",
                redirectTo: `/candidate/verify-email?email=${encodeURIComponent(email)}`,
            };
        }

        // Check account status
        if (userData.status !== "active") {
            return {
                success: false,
                message: "Your account is not active. Please contact support.",
            };
        }

        // Use Supabase Auth for login - this handles session automatically
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error("Supabase auth error:", authError);
            return {
                success: false,
                message: "Invalid email or password.",
            };
        }

        if (!authData.session) {
            return {
                success: false,
                message: "Failed to create session. Please try again.",
            };
        }

        // Debug: Log session details (remove in production)
        console.log("=== LOGIN DEBUG ===");
        console.log("Session exists:", !!authData.session);
        console.log("Access token (first 50 chars):", authData.session.access_token?.substring(0, 50));
        console.log("User ID:", authData.user?.id);
        console.log("===================");

        // Check if profile is completed
        const { data: candidateData } = await supabase
            .from("candidates")
            .select("profile_completed")
            .eq("user_id", authData.user.id)
            .single();

        // Redirect based on profile completion status
        const redirectTo = candidateData?.profile_completed
            ? "/candidate/dashboard"
            : "/candidate/create-profile";

        return {
            success: true,
            message: "Login successful!",
            redirectTo,
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}

