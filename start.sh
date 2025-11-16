#!/bin/sh
set -e

echo "🚀 Starting TravelHub..."

# Drop all existing tables for fresh deployment
echo "🗑️  Dropping all tables..."
npx tsx server/drop-tables.ts

# Push database schema
echo "📊 Pushing database schema..."
npm run db:push

# Seed the database
echo "🌱 Seeding database with demo data..."
npm run db:seed

echo "🌐 Starting application server..."

# Start the application
exec npm start
