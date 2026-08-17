import "dotenv/config";

import { seedPermissions } from "./permissions";
import { seedAdminPermissions } from "./admission-permission";

async function main() {
    console.log("Starting database seed...");

    await seedPermissions();
    await seedAdminPermissions();

    console.log("Database seed completed successfully.");
}

main()
    .catch((error) => {
        console.error("Database seed failed:", error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });