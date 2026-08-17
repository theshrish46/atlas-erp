import { db } from "@/lib/db";
import {
    roles,
    permissions,
    rolePermissions,
} from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";

export async function seedAdminPermissions() {
    const adminRoles = await db
        .select({
            roleId: roles.id,
            companyId: roles.companyId,
            roleName: roles.name,
        })
        .from(roles)
        .where(eq(roles.name, "Admin"));

    if (adminRoles.length === 0) {
        console.log("No Admin roles found.");
        return;
    }

    const allPermissions = await db
        .select({
            id: permissions.id,
        })
        .from(permissions);

    if (allPermissions.length === 0) {
        console.log("No permissions found.");
        return;
    }

    for (const adminRole of adminRoles) {
        await db
            .insert(rolePermissions)
            .values(
                allPermissions.map((permission) => ({
                    roleId: adminRole.roleId,
                    permissionId: permission.id,
                })),
            )
            .onConflictDoNothing();

        console.log(
            `Assigned ${allPermissions.length} permissions to Admin role ${adminRole.roleId}`,
        );
    }
}