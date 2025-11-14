# 🐳 Docker Deployment Guide

## Quick Start

### Option 1: Production with External Database (Recommended)

Use this when connecting to an existing remote database:

```bash
# 1. Update .env with your production database URL
DATABASE_URL=postgresql://user:password@your-db-host:5432/database

# 2. Run only the app (no local database)
docker-compose up -d app

# 3. Setup database schema
docker-compose exec app npm run db:push

# 4. Seed data (optional)
docker-compose exec app npm run db:seed
```

### Option 2: Local Development with Docker Database

Use this for local testing with a containerized database:

```bash
# 1. Update .env for local setup
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/travelhub

# 2. Run with local database
docker-compose --profile local up -d

# 3. Setup database
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
```

---

## Environment Configuration

### Required Variables

Create a `.env` file with these required variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-64-char-secret-here
STRIPE_SECRET_KEY=sk_live_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Generate SESSION_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Current Setup (Based on Your .env)

Your current configuration uses a **remote production database**:

```
postgresql://inclusivesuites-admin:NYD3CZX316Um@88.99.150.26:5432/inclusivesuites
```

To use this:

```bash
# Just run the app (connects to remote DB)
docker-compose up -d app

# Check logs
docker-compose logs -f app

# Setup schema on remote DB
docker-compose exec app npm run db:push
```

---

## Useful Commands

```bash
# Start services
docker-compose up -d

# Start with local database
docker-compose --profile local up -d

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Check status
docker-compose ps

# Stop services
docker-compose stop

# Restart app
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build

# Execute commands in container
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
docker-compose exec app sh

# Stop and remove everything
docker-compose down

# Remove with volumes (deletes database data)
docker-compose down -v
```

---

## Port Configuration

Default ports (configurable in .env):

-   **App**: http://localhost:5000
-   **Database** (if using local): localhost:5433 → container:5432

Change ports in .env:

```env
APP_PORT=8080    # Change app port
DB_PORT=5433     # Change database port (only for local postgres)
```

---

## Database Options

### 1. Remote/Production Database ✅ (Your Current Setup)

```env
DATABASE_URL=postgresql://user:pass@88.99.150.26:5432/dbname
```

**Pros:**

-   Use existing production database
-   Persistent data across deployments
-   Can be managed separately

**Cons:**

-   Network dependency
-   Needs accessible remote database

### 2. Docker Database (Local Development)

```env
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/travelhub
```

**Pros:**

-   Isolated environment
-   No external dependencies
-   Easy to reset

**Cons:**

-   Data lost when volume is removed
-   Extra container to manage

---

## Troubleshooting

### App won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - DATABASE_URL incorrect
# - Remote database unreachable
# - Missing environment variables
```

### Database connection failed

```bash
# Test database connection
docker-compose exec app psql "$DATABASE_URL" -c "SELECT version();"

# If using remote DB, check:
# - Firewall rules
# - Database credentials
# - Network connectivity
```

### Port already in use

```bash
# Change port in .env
APP_PORT=8080

# Or stop conflicting service
sudo lsof -ti:5000 | xargs kill -9
```

### Rebuild from scratch

```bash
# Remove everything and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## Production Deployment

For production deployment on a server:

1. **Update .env** with production values
2. **Build image**:

    ```bash
    docker-compose build
    ```

3. **Run in detached mode**:

    ```bash
    docker-compose up -d app
    ```

4. **Setup database**:

    ```bash
    docker-compose exec app npm run db:push
    ```

5. **Enable auto-restart**:
    ```bash
    docker update --restart=always travelhub-app
    ```

---

## Access Application

-   **Local**: http://localhost:5000
-   **Production**: http://your-domain.com:5000

### Test Accounts (after seeding)

-   Admin: admin@test.com / password123
-   Client: client1@test.com / password123

---

## For Coolify

When deploying to Coolify:

1. ✅ Dockerfile is ready
2. ✅ Environment variables configured
3. ✅ Set DATABASE_URL in Coolify to your database
4. ✅ Coolify will handle the Docker build

You don't need docker-compose in Coolify - it uses the Dockerfile directly.
