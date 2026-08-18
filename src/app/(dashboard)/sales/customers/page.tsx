"use client";

import { useMemo, useState } from "react";
import {
    Building2,
    Eye,
    Mail,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    UserRound,
    Users,
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
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CustomerType = "Company" | "Individual";

type CustomerStatus =
    | "Active"
    | "Inactive";

type Customer = {
    id: string;
    name: string;
    type: CustomerType;
    email: string;
    phone: string;
    country: string;
    city: string;
    currency: string;
    status: CustomerStatus;
};

const customers: Customer[] = [
    {
        id: "1",
        name: "Acme Industries Pvt Ltd",
        type: "Company",
        email: "accounts@acmeindustries.com",
        phone: "+91 98765 43210",
        country: "India",
        city: "Bengaluru",
        currency: "INR",
        status: "Active",
    },
    {
        id: "2",
        name: "Global Retail Solutions",
        type: "Company",
        email: "finance@globalretail.com",
        phone: "+1 415 555 0182",
        country: "United States",
        city: "San Francisco",
        currency: "USD",
        status: "Active",
    },
    {
        id: "3",
        name: "TechWorld GmbH",
        type: "Company",
        email: "billing@techworld.de",
        phone: "+49 30 555 0192",
        country: "Germany",
        city: "Berlin",
        currency: "EUR",
        status: "Active",
    },
    {
        id: "4",
        name: "Rajesh Kumar",
        type: "Individual",
        email: "rajesh@example.com",
        phone: "+91 99887 77665",
        country: "India",
        city: "Mysuru",
        currency: "INR",
        status: "Inactive",
    },
];

export default function CustomersPage() {
    const [search, setSearch] = useState("");

    const filteredCustomers = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return customers;
        }

        return customers.filter((customer) =>
            [
                customer.name,
                customer.type,
                customer.email,
                customer.phone,
                customer.country,
                customer.city,
                customer.currency,
                customer.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [search]);

    const activeCustomers = customers.filter(
        (customer) =>
            customer.status === "Active",
    ).length;

    const inactiveCustomers = customers.filter(
        (customer) =>
            customer.status === "Inactive",
    ).length;

    const companyCustomers = customers.filter(
        (customer) =>
            customer.type === "Company",
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Customers
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Manage customers, billing information,
                        currencies, and account details.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Customers
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customers.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Customers in your workspace
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active
                        </CardTitle>

                        <UserRound className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activeCustomers}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Active customer accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Companies
                        </CardTitle>

                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {companyCustomers}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Business customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inactive
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inactiveCustomers}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Inactive customer accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Directory */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Customer Directory
                            </CardTitle>

                            <CardDescription>
                                View and manage your customer
                                accounts.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search customers..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {filteredCustomers.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No customers found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredCustomers.map(
                                (customer) => (
                                    <div
                                        key={customer.id}
                                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        {/* Customer */}

                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                {customer.type ===
                                                    "Company" ? (
                                                    <Building2 className="h-5 w-5" />
                                                ) : (
                                                    <UserRound className="h-5 w-5" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {
                                                            customer.name
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={
                                                            customer.status ===
                                                                "Active"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {
                                                            customer.status
                                                        }
                                                    </Badge>

                                                    <Badge variant="outline">
                                                        {
                                                            customer.type
                                                        }
                                                    </Badge>
                                                </div>

                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {
                                                            customer.email
                                                        }
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {customer.city},{" "}
                                                        {
                                                            customer.country
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Currency + Actions */}

                                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">
                                                    Currency
                                                </p>

                                                <p className="mt-1 font-medium">
                                                    {
                                                        customer.currency
                                                    }
                                                </p>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />

                                                        <span className="sr-only">
                                                            Customer
                                                            actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Customer
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Edit Customer
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        View Sales Orders
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        View Invoices
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        View Payments
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        {customer.status ===
                                                            "Active"
                                                            ? "Deactivate Customer"
                                                            : "Activate Customer"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}