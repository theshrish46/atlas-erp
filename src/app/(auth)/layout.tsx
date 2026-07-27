import Link from "next/link";
import { Building2 } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="grid min-h-screen lg:grid-cols-2">
            {/* Left Side */}
            <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
                <ThemeToggle />
            </div>
            <section className="relative hidden overflow-hidden bg-muted lg:flex">


                <div className="mx-auto flex w-full max-w-xl flex-col justify-between p-16">
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <Building2 className="h-6 w-6" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">
                                    Atlas ERP
                                </h1>

                                <p className="text-sm text-muted-foreground">
                                    Enterprise Resource Planning
                                </p>
                            </div>
                        </Link>

                        <div className="mt-24 space-y-8">
                            <h2 className="text-5xl font-bold leading-tight tracking-tight">
                                Build your business,
                                <br />
                                not your paperwork.
                            </h2>

                            <p className="max-w-md text-lg leading-8 text-muted-foreground">
                                Manage inventory, finance, HR, procurement,
                                sales and analytics from one modern platform.
                            </p>

                            <div className="space-y-5 pt-6">
                                <Feature text="Role-based access control" />
                                <Feature text="Inventory & warehouse management" />
                                <Feature text="Procurement & purchase workflow" />
                                <Feature text="Sales, invoices & accounting" />
                                <Feature text="Real-time business analytics" />
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Atlas ERP. All rights reserved.
                    </p>
                </div>
            </section>

            {/* Right Side */}
            <section className="relative flex items-center justify-center bg-background px-6 py-12">

                <div className="w-full max-w-md">
                    {children}
                </div>
            </section>
        </main>
    );
}

function Feature({
    text,
}: {
    text: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <p className="text-muted-foreground">
                {text}
            </p>
        </div>
    );
}