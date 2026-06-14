"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Building2, Users, Search, Loader2, Eye } from "lucide-react";

interface Job {
    id: string;
    job_title: string;
    location: string | null;
    industry: string | null;
    job_type: string;
    status: string;
    expires_at: string | null;
    published_at: string | null;
    created_at: string;
    is_deleted: boolean;
    company: { id: string; company_name: string; logo_url: string | null };
    employer: { first_name: string; last_name: string };
    job_applications: { count: number }[];
    payment_requests: { status: string; payment_types: { code: string } }[];
}

const STATUS_OPTIONS = [
    { value: "__all__", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "paused", label: "Paused" },
    { value: "expired", label: "Expired" },
    { value: "deleted", label: "Deleted" },
];

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    draft: { label: "Draft", variant: "secondary" },
    published: { label: "Published", variant: "default" },
    paused: { label: "Paused", variant: "outline" },
    expired: { label: "Expired", variant: "destructive" },
    deleted: { label: "Deleted", variant: "destructive" },
};

const JOB_TYPE_LABELS: Record<string, string> = {
    full_time: "Full Time", part_time: "Part Time", contract: "Contract",
    internship: "Internship", freelance: "Freelance",
};

function fmt(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function MisJobsClient() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("__all__");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const limit = 20;

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("search", search);
        if (status !== "__all__") params.set("status", status);
        if (includeDeleted) params.set("include_deleted", "true");

        const res = await fetch(`/api/mis/jobs?${params}`);
        if (res.ok) {
            const d = await res.json();
            setJobs(d.jobs);
            setTotal(d.pagination.total);
        }
        setLoading(false);
    }, [search, status, page, includeDeleted]);

    useEffect(() => { setPage(1); }, [search, status, includeDeleted]);
    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Job Advertisements</h1>
                    <p className="text-muted-foreground text-sm mt-1">{total} job{total !== 1 ? "s" : ""} found</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search job title..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button
                    variant={includeDeleted ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIncludeDeleted(!includeDeleted)}
                >
                    {includeDeleted ? "Hide Deleted" : "Show Deleted"}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No job advertisements found.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {jobs.map((job) => {
                            const statusInfo = STATUS_LABELS[job.status] ?? { label: job.status, variant: "secondary" as const };
                            const appCount = job.job_applications?.[0]?.count ?? 0;
                            const company = Array.isArray(job.company) ? job.company[0] : job.company;
                            const employer = Array.isArray(job.employer) ? job.employer[0] : job.employer;
                            const pendingPr = job.payment_requests?.find((r) => ["pending_payment", "under_review"].includes(r.status));

                            return (
                                <Card key={job.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                    {company?.logo_url
                                                        ? <img src={company.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                                        : <Building2 className="h-5 w-5 text-muted-foreground" />
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-sm truncate">{job.job_title}</h3>
                                                        <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
                                                        {pendingPr && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Payment Pending</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{company?.company_name} · {employer?.first_name} {employer?.last_name}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                                                        <span>{JOB_TYPE_LABELS[job.job_type] ?? job.job_type}</span>
                                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{appCount} app{appCount !== 1 ? "s" : ""}</span>
                                                        {job.status === "published" && job.expires_at && <span>Expires {fmt(job.expires_at)}</span>}
                                                        <span>Created {fmt(job.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/mis/jobs/${job.id}`)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {total > limit && (
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                            <span className="flex items-center text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
