#!/bin/sh
set -e

echo "🚀 Starting TravelHub..."

# Push database schema
echo "📊 Pushing database schema..."
npm run db:push --force || true

# Seed the database
echo "🌱 Seeding database with demo data..."
npm run db:seed

echo "🌐 Starting application server..."

# Start the application
exec npm start
