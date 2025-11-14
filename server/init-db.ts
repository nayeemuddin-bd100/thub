import { exec } from "child_process";
import "dotenv/config";
import { count } from "drizzle-orm";
import { promisify } from "util";
import { users } from "../shared/schema";
import { db } from "./db";

const execAsync = promisify(exec);

async function initializeDatabase() {
    try {
        console.log("🔍 Checking database status...");

        // Check if users table exists and has data
        const result = await db.select({ count: count() }).from(users);
        const userCount = result[0]?.count || 0;

        if (userCount === 0) {
            console.log(
                "📦 Database is empty. Running migrations and seeding..."
            );

            // Run migrations
            console.log("⚙️  Running database migrations...");
            await execAsync("npm run db:push");
            console.log("✅ Migrations completed");

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
        process.exit(0);
    } catch (error) {
        console.error("❌ Database initialization failed:", error);

        // If table doesn't exist, run migrations first
        if (
            error instanceof Error &&
            error.message.includes("does not exist")
        ) {
            console.log("📋 Creating database schema...");
            try {
                await execAsync("npm run db:push");
                console.log("✅ Schema created. Now seeding...");
                await execAsync("npm run db:seed");
                console.log("✅ Database initialized successfully");
                process.exit(0);
            } catch (initError) {
                console.error("❌ Failed to initialize database:", initError);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
}

initializeDatabase();
