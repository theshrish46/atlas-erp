"use client";

import { useState } from "react";
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
    Pencil,
    Send,
    User,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type LeaveStatus = "Pending" | "Approved" | "Rejected";

type LeaveRequest = {
    id: string;
    subject: string;
    description: string;
    leaveDate: string;
    status: LeaveStatus;
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const [fullName, setFullName] = useState("John Doe");
    const [email, setEmail] = useState("john@company.com");

    const [editFullName, setEditFullName] = useState(fullName);
    const [editEmail, setEditEmail] = useState(email);

    const [leaveSubject, setLeaveSubject] = useState("");
    const [leaveDescription, setLeaveDescription] = useState("");
    const [leaveDate, setLeaveDate] = useState("");

    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
        {
            id: "1",
            subject: "Personal Work",
            description: "Need to attend to some personal work.",
            leaveDate: "2026-08-28",
            status: "Pending",
        },
    ]);

    function handleEdit() {
        setEditFullName(fullName);
        setEditEmail(email);
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setEditFullName(fullName);
        setEditEmail(email);
        setIsEditing(false);
    }

    function handleSaveProfile() {
        setFullName(editFullName);
        setEmail(editEmail);
        setIsEditing(false);
    }

    function handleLeaveSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (
            !leaveSubject.trim() ||
            !leaveDescription.trim() ||
            !leaveDate
        ) {
            return;
        }

        const newRequest: LeaveRequest = {
            id: crypto.randomUUID(),
            subject: leaveSubject.trim(),
            description: leaveDescription.trim(),
            leaveDate,
            status: "Pending",
        };

        setLeaveRequests((current) => [
            newRequest,
            ...current,
        ]);

        setLeaveSubject("");
        setLeaveDescription("");
        setLeaveDate("");
    }

    function getStatusIcon(status: LeaveStatus) {
        switch (status) {
            case "Approved":
                return (
                    <CheckCircle2 className="h-4 w-4" />
                );

            case "Rejected":
                return (
                    <XCircle className="h-4 w-4" />
                );

            default:
                return (
                    <Clock3 className="h-4 w-4" />
                );
        }
    }

    function getStatusClassName(status: LeaveStatus) {
        switch (status) {
            case "Approved":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            case "Rejected":
                return "bg-red-50 text-red-700 border-red-200";

            default:
                return "bg-amber-50 text-amber-700 border-amber-200";
        }
    }

    function formatDate(date: string) {
        if (!date) {
            return "";
        }

        return new Date(
            `${date}T00:00:00`,
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
            {/* ================================================================
                PAGE HEADER
            ================================================================= */}

            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Profile
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your personal information and leave requests.
                </p>
            </div>

            {/* ================================================================
                PROFILE
            ================================================================= */}

            <Card>
                <CardHeader className="border-b">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Personal Information</CardTitle>

                            <CardDescription className="mt-1">
                                Your personal and account information.
                            </CardDescription>
                        </div>

                        {!isEditing && (
                            <Button
                                variant="outline"
                                onClick={handleEdit}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {isEditing ? (
                        <div className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">
                                        Full Name
                                    </Label>

                                    <Input
                                        id="fullName"
                                        value={editFullName}
                                        onChange={(event) =>
                                            setEditFullName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Address
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        value={editEmail}
                                        onChange={(event) =>
                                            setEditEmail(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={
                                        !editFullName.trim() ||
                                        !editEmail.trim()
                                    }
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Profile identity */}

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <User className="h-7 w-7" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {fullName}
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Administrator
                                    </p>
                                </div>
                            </div>

                            {/* Information */}

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Full Name
                                        </p>

                                        <p className="mt-1 truncate text-sm font-medium">
                                            {fullName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Email Address
                                        </p>

                                        <p className="mt-1 truncate text-sm font-medium">
                                            {email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Company
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            Acme Technologies
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Role
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            Administrator
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ================================================================
                LEAVE REQUESTS
            ================================================================= */}

            <Card>
                <CardHeader className="border-b">
                    <CardTitle>Leave Requests</CardTitle>

                    <CardDescription>
                        Raise a leave request and track your submitted requests.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        {/* ====================================================
                            RAISE LEAVE
                        ===================================================== */}

                        <div>
                            <div className="mb-5">
                                <h3 className="text-sm font-semibold">
                                    Request Leave
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Submit a request for a specific day.
                                </p>
                            </div>

                            <form
                                onSubmit={handleLeaveSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="leaveSubject">
                                        Subject
                                    </Label>

                                    <Input
                                        id="leaveSubject"
                                        value={leaveSubject}
                                        onChange={(event) =>
                                            setLeaveSubject(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Reason for leave"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="leaveDescription">
                                        Description
                                    </Label>

                                    <Textarea
                                        id="leaveDescription"
                                        value={leaveDescription}
                                        onChange={(event) =>
                                            setLeaveDescription(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Provide a short description"
                                        className="min-h-24 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="leaveDate">
                                        Leave Date
                                    </Label>

                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            id="leaveDate"
                                            type="date"
                                            value={leaveDate}
                                            onChange={(event) =>
                                                setLeaveDate(
                                                    event.target.value,
                                                )
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto"
                                    disabled={
                                        !leaveSubject.trim() ||
                                        !leaveDescription.trim() ||
                                        !leaveDate
                                    }
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Request
                                </Button>
                            </form>
                        </div>

                        {/* ====================================================
                            MY REQUESTS
                        ===================================================== */}

                        <div>
                            <div className="mb-5">
                                <h3 className="text-sm font-semibold">
                                    My Requests
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Your previously submitted leave requests.
                                </p>
                            </div>

                            {leaveRequests.length === 0 ? (
                                <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 text-center">
                                    <CalendarDays className="h-8 w-8 text-muted-foreground/60" />

                                    <p className="mt-3 text-sm font-medium">
                                        No leave requests
                                    </p>

                                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                        Your submitted leave requests will
                                        appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaveRequests.map(
                                        (request) => (
                                            <div
                                                key={request.id}
                                                className="rounded-lg border p-4"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold">
                                                            {request.subject}
                                                        </p>

                                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                            {
                                                                request.description
                                                            }
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                                                            request.status,
                                                        )}`}
                                                    >
                                                        {getStatusIcon(
                                                            request.status,
                                                        )}

                                                        {
                                                            request.status
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                                                    <CalendarDays className="h-3.5 w-3.5" />

                                                    <span>
                                                        {
                                                            formatDate(
                                                                request.leaveDate,
                                                            )
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}