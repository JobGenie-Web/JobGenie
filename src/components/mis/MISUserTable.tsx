"use client";

import { format } from "date-fns";
import { Users } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface MISUser {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

interface MISUserTableProps {
    users: MISUser[];
    isLoading?: boolean;
}

export function MISUserTable({ users, isLoading = false }: MISUserTableProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className="bg-card border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Created Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-28" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    // Empty state
    if (users.length === 0) {
        return (
            <div className="bg-card border rounded-lg p-12">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                        <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No MIS Users Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Get started by adding your first MIS user. Click the "Add MIS User" button above to send an invitation.
                    </p>
                </div>
            </div>
        );
    }

    // Table with data
    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.user_id}>
                                <TableCell className="font-medium">
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
