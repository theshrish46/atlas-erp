"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BarChart3,
    Bell,
    Boxes,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    FileText,
    LayoutDashboard,
    Menu,
    Package,
    PanelLeft,
    Settings,
    ShoppingCart,
    Users,
    X,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";

const navigation = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Sales",
        href: "/dashboard/sales",
        icon: CircleDollarSign,
    },
    {
        title: "Purchases",
        href: "/dashboard/purchases",
        icon: ShoppingCart,
    },
    {
        title: "Inventory",
        href: "/dashboard/inventory",
        icon: Boxes,
    },
    {
        title: "Products",
        href: "/dashboard/products",
        icon: Package,
    },
    {
        title: "Finance",
        href: "/dashboard/finance",
        icon: BarChart3,
    },
    {
        title: "HR",
        href: "/dashboard/hr",
        icon: Users,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
    },
];

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Overlay */}

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex flex-col
                    border-r bg-card
                    transition-all duration-300
                    ${collapsed ? "w-[72px]" : "w-64"}
                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {/* Logo */}

                <div className="flex h-16 items-center border-b px-4">
                    <Link
                        href="/dashboard"
                        className="flex min-w-0 items-center gap-3"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Building2 className="h-5 w-5" />
                        </div>

                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                    Atlas ERP
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                    Enterprise Resource Planning
                                </p>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close */}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}

                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {!collapsed && (
                        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Workspace
                        </p>
                    )}

                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.title : undefined}
                                className={`
                                    group flex items-center rounded-lg
                                    text-sm font-medium
                                    text-muted-foreground
                                    transition-colors
                                    hover:bg-muted hover:text-foreground
                                    ${collapsed
                                        ? "justify-center px-2 py-2.5"
                                        : "gap-3 px-3 py-2.5"
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5 shrink-0" />

                                {!collapsed && (
                                    <span>{item.title}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Navigation */}

                <div className="space-y-1 border-t p-3">
                    <Link
                        href="/dashboard/settings"
                        title={collapsed ? "Settings" : undefined}
                        className={`
                            flex items-center rounded-lg
                            text-sm font-medium
                            text-muted-foreground
                            transition-colors
                            hover:bg-muted hover:text-foreground
                            ${collapsed
                                ? "justify-center px-2 py-2.5"
                                : "gap-3 px-3 py-2.5"
                            }
                        `}
                    >
                        <Settings className="h-5 w-5 shrink-0" />

                        {!collapsed && (
                            <span>Settings</span>
                        )}
                    </Link>

                    {/* User */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`
                                    flex w-full items-center rounded-lg
                                    text-left
                                    hover:bg-muted
                                    ${collapsed
                                        ? "justify-center p-2"
                                        : "gap-3 p-2"
                                    }
                                `}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    JD
                                </div>

                                {!collapsed && (
                                    <>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                John Doe
                                            </p>

                                            <p className="truncate text-xs text-muted-foreground">
                                                Administrator
                                            </p>
                                        </div>

                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </>
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side={collapsed ? "right" : "top"}
                            align="end"
                            className="w-56"
                        >
                            <DropdownMenuLabel>
                                My Account
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile">
                                    Profile
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings">
                                    Settings
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Area */}

            <div
                className={`
                    min-h-screen
                    transition-[padding] duration-300
                    ${collapsed
                        ? "lg:pl-[72px]"
                        : "lg:pl-64"
                    }
                `}
            >
                {/* Navbar */}

                <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur sm:px-6">
                    {/* Desktop Sidebar Toggle */}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex"
                        onClick={() =>
                            setCollapsed((value) => !value)
                        }
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        {collapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </Button>

                    {/* Mobile Sidebar Toggle */}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Separator
                        orientation="vertical"
                        className="mx-3 hidden h-6 lg:block"
                    />

                    {/* Page Title */}

                    <div className="flex-1">
                        <h1 className="text-sm font-semibold">
                            Dashboard
                        </h1>

                        <p className="hidden text-xs text-muted-foreground sm:block">
                            Overview of your business
                        </p>
                    </div>

                    {/* Navbar Actions */}

                    <div className="flex items-center gap-1">
                        {/* Theme */}

                        <ThemeToggle />

                        {/* Notifications */}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                        >
                            <Bell className="h-5 w-5" />

                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                        </Button>

                        <Separator
                            orientation="vertical"
                            className="mx-2 h-6"
                        />

                        {/* Profile */}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="gap-2 px-2"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        JD
                                    </div>

                                    <span className="hidden text-sm sm:inline">
                                        John Doe
                                    </span>

                                    <ChevronDown className="hidden h-4 w-4 sm:inline" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-56"
                            >
                                <DropdownMenuLabel>
                                    John Doe
                                    <p className="mt-1 font-normal text-muted-foreground">
                                        john@company.com
                                    </p>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href="/profile">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/settings">
                                        Settings
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem>
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}