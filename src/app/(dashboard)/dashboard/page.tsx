import {
    Activity,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    ShoppingCart,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Here's an overview of your business.
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Sales
                        </CardTitle>

                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            —
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Sales data will appear here
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Purchases
                        </CardTitle>

                        <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            —
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Purchase data will appear here
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inventory
                        </CardTitle>

                        <Boxes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            —
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Inventory data will appear here
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Activity
                        </CardTitle>

                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            —
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Recent activity will appear here
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Area */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Recent Activity
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">
                                No recent activity
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Business Overview
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">
                                Business metrics will appear here
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}