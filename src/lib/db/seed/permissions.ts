import { db } from "@/lib/db";
import { permissions } from "@/lib/db/schema/schema";

const permissionData = [
    // Dashboard
    {
        key: "dashboard.view",
        description: "View dashboard",
    },

    // Employees
    {
        key: "employees.view",
        description: "View employees",
    },
    {
        key: "employees.create",
        description: "Create employees",
    },
    {
        key: "employees.update",
        description: "Update employees",
    },
    {
        key: "employees.delete",
        description: "Delete employees",
    },

    // Departments
    {
        key: "departments.view",
        description: "View departments",
    },
    {
        key: "departments.create",
        description: "Create departments",
    },
    {
        key: "departments.update",
        description: "Update departments",
    },
    {
        key: "departments.delete",
        description: "Delete departments",
    },

    // Roles
    {
        key: "roles.view",
        description: "View roles",
    },
    {
        key: "roles.create",
        description: "Create roles",
    },
    {
        key: "roles.update",
        description: "Update roles",
    },
    {
        key: "roles.delete",
        description: "Delete roles",
    },

    // Sales
    {
        key: "sales.view",
        description: "View sales",
    },
    {
        key: "sales.create",
        description: "Create sales",
    },
    {
        key: "sales.update",
        description: "Update sales",
    },
    {
        key: "sales.delete",
        description: "Delete sales",
    },

    // Purchases
    {
        key: "purchases.view",
        description: "View purchases",
    },
    {
        key: "purchases.create",
        description: "Create purchases",
    },
    {
        key: "purchases.update",
        description: "Update purchases",
    },
    {
        key: "purchases.delete",
        description: "Delete purchases",
    },

    // Inventory
    {
        key: "inventory.view",
        description: "View inventory",
    },
    {
        key: "inventory.create",
        description: "Create inventory records",
    },
    {
        key: "inventory.update",
        description: "Update inventory",
    },
    {
        key: "inventory.delete",
        description: "Delete inventory",
    },

    // Products
    {
        key: "products.view",
        description: "View products",
    },
    {
        key: "products.create",
        description: "Create products",
    },
    {
        key: "products.update",
        description: "Update products",
    },
    {
        key: "products.delete",
        description: "Delete products",
    },

    // Finance
    {
        key: "finance.view",
        description: "View finance",
    },
    {
        key: "finance.create",
        description: "Create financial records",
    },
    {
        key: "finance.update",
        description: "Update financial records",
    },
    {
        key: "finance.delete",
        description: "Delete financial records",
    },

    // HR
    {
        key: "hr.view",
        description: "View HR",
    },
    {
        key: "hr.create",
        description: "Create HR records",
    },
    {
        key: "hr.update",
        description: "Update HR records",
    },
    {
        key: "hr.delete",
        description: "Delete HR records",
    },

    // Reports
    {
        key: "reports.view",
        description: "View reports",
    },
];

export async function seedPermissions() {
    await db
        .insert(permissions)
        .values(permissionData)
        .onConflictDoNothing();

    console.log(
        `Seeded ${permissionData.length} permissions`,
    );
}