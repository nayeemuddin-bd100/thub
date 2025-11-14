# Fix Production Database Connection

## Problem

The application in Coolify cannot connect to the PostgreSQL database at 88.99.150.26:5432
Error: `connect ETIMEDOUT 88.99.150.26:5432`

## Solution Options

### Option 1: Use localhost (if PostgreSQL is on same server) ⭐ RECOMMENDED

In Coolify → Your Application → Environment Variables:

Change:

```
DATABASE_URL=postgresql://inclusivesuites-admin:NYD3CZX316Um@88.99.150.26:5432/inclusivesuites
```

To:

```
DATABASE_URL=postgresql://inclusivesuites-admin:NYD3CZX316Um@localhost:5432/inclusivesuites
```

Then click **Redeploy**.

---

### Option 2: Configure PostgreSQL to Allow Remote Connections

If PostgreSQL is on a different server, run these commands on the database server (88.99.150.26):

#### Step 1: Edit PostgreSQL Configuration

```bash
# Find PostgreSQL version
ls /etc/postgresql/

# Edit postgresql.conf (replace 14 with your version)
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and change:
listen_addresses = 'localhost'
# To:
listen_addresses = '*'
```

#### Step 2: Edit Client Authentication

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add this line at the end:
host    all             all             0.0.0.0/0               md5
```

#### Step 3: Configure Firewall

```bash
# Allow PostgreSQL port
sudo ufw allow 5432/tcp

# Or allow only from Coolify server IP
sudo ufw allow from COOLIFY_SERVER_IP to any port 5432
```

#### Step 4: Restart PostgreSQL

```bash
sudo systemctl restart postgresql
```

#### Step 5: Test Connection

```bash
psql -h 88.99.150.26 -U inclusivesuites-admin -d inclusivesuites
```

---

### Option 3: Create PostgreSQL Database in Coolify

1. In Coolify dashboard, go to your project
2. Click **"+ New Resource"** → **"Database"** → **"PostgreSQL"**
3. Create database named `inclusivesuites`
4. Copy the internal connection string
5. Update DATABASE_URL in your application environment variables
6. Redeploy application

---

## After Fixing Connection

Once the database connection works:

1. Application will auto-seed on startup
2. You can login with demo credentials:
    - Email: `admin@test.com`
    - Password: `password123`

## Check if it worked

In Coolify logs, you should see:

```
🔍 Checking database status...
⚙️  Running database migrations...
✅ Schema is up to date
📦 Database is empty. Seeding with initial data...
🌱 Seeding database with initial data...
✅ Database seeded successfully
```
