# 🔐 Demo Accounts

This document lists all demo/test accounts available after running the database seed command (`npm run db:seed`).

**Default Password for All Accounts**: `password123`

---

## 👤 Available Demo Accounts

### 1. Administrator Account
- **Email**: `admin@test.com`
- **Password**: `password123`
- **Name**: Admin User
- **Role**: Administrator
- **Access**: Full system access, user management, analytics dashboard

---

### 2. Client Accounts

#### Client 1
- **Email**: `client1@test.com`
- **Password**: `password123`
- **Name**: Sarah Johnson
- **Role**: Client
- **Access**: Book properties, order services, manage bookings, live chat

#### Client 2
- **Email**: `client2@test.com`
- **Password**: `password123`
- **Name**: Michael Chen
- **Role**: Client
- **Access**: Book properties, order services, manage bookings, live chat

---

### 3. Property Owner Accounts

#### Property Owner 1
- **Email**: `owner1@test.com`
- **Password**: `password123`
- **Name**: David Martinez
- **Role**: Property Owner
- **Access**: Manage properties, view bookings, property analytics

#### Property Owner 2
- **Email**: `owner2@test.com`
- **Password**: `password123`
- **Name**: Emily Thompson
- **Role**: Property Owner
- **Access**: Manage properties, view bookings, property analytics

---

### 4. Service Provider Accounts

#### Service Provider 1
- **Email**: `provider1@test.com`
- **Password**: `password123`
- **Name**: Carlos Rodriguez
- **Role**: Service Provider
- **Access**: Manage services, accept/reject jobs, complete service tasks

#### Service Provider 2
- **Email**: `provider2@test.com`
- **Password**: `password123`
- **Name**: Lisa Anderson
- **Role**: Service Provider
- **Access**: Manage services, accept/reject jobs, complete service tasks

---

### 5. Billing Account
- **Email**: `billing@test.com`
- **Password**: `password123`
- **Name**: Bill Finance
- **Role**: Billing
- **Access**: Billing dashboard, financial reports, revenue stats, payment management
- **Dashboard**: `/billing-dashboard`
- **Features**: View all transactions, revenue analytics, payment status tracking

---

### 6. Operation Account
- **Email**: `operation@test.com`
- **Password**: `password123`
- **Name**: Ops Manager
- **Role**: Operation
- **Access**: Operation dashboard, user management, system monitoring
- **Dashboard**: `/operation-dashboard`
- **Features**: User search, system stats, activity monitoring, user role management

---

### 7. Marketing Account
- **Email**: `marketing@test.com`
- **Password**: `password123`
- **Name**: Mark Campaign
- **Role**: Marketing
- **Access**: Marketing dashboard, promotional codes, campaigns
- **Dashboard**: `/marketing-dashboard`
- **Features**: Promo code management, campaign analytics, featured property management

---

### 8. Country Manager Account
- **Email**: `manager@test.com`
- **Password**: `password123`
- **Name**: James Wilson
- **Role**: Country Manager
- **Access**: Assign jobs to service providers, manage regional operations, recruit city managers

---

### 9. City Manager Account
- **Email**: `citymanager@test.com`
- **Password**: `password123`
- **Name**: City Chief
- **Role**: City Manager
- **Access**: City manager dashboard, host/provider recruitment, city-level management
- **Dashboard**: `/city-manager-dashboard`
- **Features**: Provider applications, host recruitment, city properties/services

---

### 10. Operation Support Account
- **Email**: `support@test.com`
- **Password**: `password123`
- **Name**: Support Team
- **Role**: Operation Support
- **Access**: Manage all support messages, respond to user inquiries, support dashboard
- **Note**: Only one operation support user can exist in the system at a time

---

## 🚀 How to Use Demo Accounts

### 1. Seed the Database
First, ensure your database is seeded with demo data:

```bash
npm run db:seed
```

### 2. Login
Navigate to the login page and use any of the accounts listed above:
- Email: One of the emails from above
- Password: `password123`

### 3. Explore Different Roles
Each role has different dashboards and capabilities:
- **Admin**: Manage all users, view system analytics (`/admin`)
- **Billing**: Financial reports, revenue tracking, payment management (`/billing-dashboard`)
- **Operation**: User management, system monitoring (`/operation-dashboard`)
- **Marketing**: Promotional campaigns, promo codes (`/marketing-dashboard`)
- **Client**: Browse and book properties, order services (`/dashboard`)
- **Property Owner**: List and manage properties (`/dashboard`)
- **Service Provider**: Offer and deliver services (`/provider-config`, `/provider-orders`)
- **Country Manager**: Assign and manage service jobs
- **City Manager**: Host/provider recruitment, city management (`/city-manager-dashboard`)
- **Operation Support**: Manage all support messages (`/support-dashboard`)

---

## 💬 Role-Based Messaging Permissions

The messaging system enforces strict role-based permissions. Each role can only message certain other roles:

### Admin Roles (Admin, Billing, Operation, Marketing)
**Can message**: Country Manager, City Manager, Property Owner, Service Provider, Client
**Cannot message**: Other admin roles (e.g., admin cannot message billing)

### Country Manager
**Can message**: Admin, Billing, Operation, Marketing, other Country Managers, Property Owners, Service Providers

### City Manager
**Can message**: Admin, Billing, Operation, Marketing, Country Manager, Property Owners, Clients

### Property Owner
**Can message**: Admin, Billing, Operation, Marketing, City Manager, Clients

### Service Provider
**Can message**: Admin, Billing, Operation, Marketing, Country Manager, Clients

### Client
**Can message**: Admin, Billing, Operation, Marketing, Property Owners, Service Providers

### Operation Support
**Can message**: All roles (unrestricted access for support purposes)

### How to Test Messaging
1. Login with any account (e.g., `billing@test.com`)
2. Navigate to Messages page (`/messages`)
3. Click "New Message" button
4. You'll see only the roles you're allowed to message in the dropdown
5. Select a role, then select a user from that role
6. Start a conversation

---

## ⚠️ Security Notice

**Important**: These are test accounts for development and demonstration purposes only.

### For Production Deployment:
1. ❌ **DO NOT** run `npm run db:seed` in production
2. ✅ Change all default passwords
3. ✅ Delete or disable test accounts
4. ✅ Create real user accounts with strong passwords
5. ✅ Use proper authentication and security practices

---

## 📋 Quick Reference Table

| Email | Password | Name | Role | Dashboard |
|-------|----------|------|------|-----------|
| admin@test.com | password123 | Admin User | Administrator | `/admin` |
| billing@test.com | password123 | Bill Finance | Billing | `/billing-dashboard` |
| operation@test.com | password123 | Ops Manager | Operation | `/operation-dashboard` |
| marketing@test.com | password123 | Mark Campaign | Marketing | `/marketing-dashboard` |
| client1@test.com | password123 | Sarah Johnson | Client | `/dashboard` |
| client2@test.com | password123 | Michael Chen | Client | `/dashboard` |
| owner1@test.com | password123 | David Martinez | Property Owner | `/dashboard` |
| owner2@test.com | password123 | Emily Thompson | Property Owner | `/dashboard` |
| provider1@test.com | password123 | Carlos Rodriguez | Service Provider | `/provider-config` |
| provider2@test.com | password123 | Lisa Anderson | Service Provider | `/provider-config` |
| manager@test.com | password123 | James Wilson | Country Manager | - |
| citymanager@test.com | password123 | City Chief | City Manager | `/city-manager-dashboard` |
| support@test.com | password123 | Support Team | Operation Support | `/support-dashboard` |

---

## 🔄 Resetting Demo Data

To reset all demo data and start fresh:

```bash
# This will delete all existing data and recreate demo accounts
npm run db:seed
```

**Warning**: This command deletes ALL data in the database before reseeding!
