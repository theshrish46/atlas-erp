"use client";

import {
    Clock,
    Mail,
    MoreHorizontal,
    Plus,
    RefreshCw,
    UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const invitations = [
    {
        id: "1",
        email: "manager@company.com",
        role: "Manager",
        status: "Pending",
        expiresAt: "Aug 22, 2026",
        sentAt: "Aug 15, 2026",
    },
    {
        id: "2",
        email: "employee@company.com",
        role: "Employee",
        status: "Pending",
        expiresAt: "Aug 21, 2026",
        sentAt: "Aug 14, 2026",
    },
    {
        id: "3",
        email: "sales@company.com",
        role: "Employee",
        status: "Accepted",
        expiresAt: "Aug 18, 2026",
        sentAt: "Aug 11, 2026",
    },
];

export default function InvitationsPage() {
    const pendingInvitations = invitations.filter(
        (invitation) => invitation.status === "Pending"
    ).length;

    const acceptedInvitations = invitations.filter(
        (invitation) => invitation.status === "Accepted"
    ).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Invitations
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Invite employees to your workspace and assign their
                        initial roles.
                    </p>
                </div>

                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Invite Employee
                </Button>
            </div>

            {/* Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Mail className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Invitations
                            </p>

                            <p className="text-2xl font-bold">
                                {invitations.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Pending
                            </p>

                            <p className="text-2xl font-bold">
                                {pendingInvitations}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Accepted
                            </p>

                            <p className="text-2xl font-bold">
                                {acceptedInvitations}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invitation List */}
            <Card>
                <CardHeader>
                    <CardTitle>Workspace Invitations</CardTitle>

                    <CardDescription>
                        View and manage invitations sent to employees.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="divide-y">
                        {invitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">
                                                {invitation.email}
                                            </h3>

                                            <Badge
                                                variant={
                                                    invitation.status ===
                                                        "Accepted"
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {invitation.status}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Role: {invitation.role}
                                        </p>

                                        <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                                            <span>
                                                Sent {invitation.sentAt}
                                            </span>

                                            <span>
                                                Expires{" "}
                                                {invitation.expiresAt}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end">
                                        {invitation.status === "Pending" && (
                                            <>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Resend Invitation
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem className="text-destructive">
                                                    Revoke Invitation
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {invitation.status === "Accepted" && (
                                            <DropdownMenuItem>
                                                View Employee
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}