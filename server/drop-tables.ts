import { sql } from "drizzle-orm";
import { db } from "./db";

async function dropAllTables() {
  // Safety check: Allow disabling database reset if needed
  if (process.env.DISABLE_DB_RESET === 'true') {
    console.log("⚠️  Database reset disabled (DISABLE_DB_RESET=true)");
    process.exit(0);
  }

  console.log("🔄 Database reset enabled (set DISABLE_DB_RESET=true to skip)");

  try {
    console.log("🗑️  Dropping all database tables...");
    
    // Query all user tables (excluding system tables)
    const result = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != '__drizzle_migrations'
    `);

    const tables = result.rows as { tablename: string }[];
    
    if (tables.length === 0) {
      console.log("✅ No tables to drop");
      process.exit(0);
    }

    console.log(`Found ${tables.length} tables to drop`);

    // Drop all tables with CASCADE to handle foreign keys
    for (const { tablename } of tables) {
      console.log(`  Dropping table: ${tablename}`);
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tablename}" CASCADE`));
    }

    console.log("✅ All tables dropped successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
    console.error("Database reset failed - deployment will abort");
    process.exit(1);
  }
}

dropAllTables();
