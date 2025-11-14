import { exec } from "child_process";
import { count } from "drizzle-orm";
import { promisify } from "util";
import { users } from "../shared/schema";
import { db } from "./db";

const execAsync = promisify(exec);

// Run database initialization asynchronously without blocking server startup
(async () => {
    try {
        // Wait a bit for server to be fully up
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("🔍 Checking database status...");

        // First, ensure schema exists
        console.log("⚙️  Running database migrations...");
        try {
            await execAsync("npm run db:push");
            console.log("✅ Schema is up to date");
        } catch (migrationError) {
            console.error("❌ Migration failed:", migrationError);
            throw migrationError;
        }

        // Check if users table exists and has data
        let userCount = 0;
        try {
            const result = await db.select({ count: count() }).from(users);
            userCount = result[0]?.count || 0;
        } catch (queryError) {
            console.error("❌ Failed to query users table:", queryError);
            userCount = 0;
        }

        if (userCount === 0) {
            console.log("📦 Database is empty. Seeding with initial data...");

            // Run seed
            console.log("🌱 Seeding database with initial data...");
            await execAsync("npm run db:seed");
            console.log("✅ Database seeded successfully");
        } else {
            console.log(
                `✅ Database already has ${userCount} users. Skipping seed.`
            );
        }

        console.log("🚀 Database initialization complete!");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        console.log(
            "⚠️  Application will continue running, but database may not be initialized"
        );
    }
})();
