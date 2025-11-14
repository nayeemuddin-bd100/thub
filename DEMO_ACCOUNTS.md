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

### 5. Country Manager Account
- **Email**: `manager@test.com`
- **Password**: `password123`
- **Name**: James Wilson
- **Role**: Country Manager
- **Access**: Assign jobs to service providers, manage regional operations

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
- **Admin**: Manage all users, view system analytics
- **Client**: Browse and book properties, order services
- **Property Owner**: List and manage properties
- **Service Provider**: Offer and deliver services
- **Country Manager**: Assign and manage service jobs

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

| Email | Password | Name | Role |
|-------|----------|------|------|
| admin@test.com | password123 | Admin User | Administrator |
| client1@test.com | password123 | Sarah Johnson | Client |
| client2@test.com | password123 | Michael Chen | Client |
| owner1@test.com | password123 | David Martinez | Property Owner |
| owner2@test.com | password123 | Emily Thompson | Property Owner |
| provider1@test.com | password123 | Carlos Rodriguez | Service Provider |
| provider2@test.com | password123 | Lisa Anderson | Service Provider |
| manager@test.com | password123 | James Wilson | Country Manager |

---

## 🔄 Resetting Demo Data

To reset all demo data and start fresh:

```bash
# This will delete all existing data and recreate demo accounts
npm run db:seed
```

**Warning**: This command deletes ALL data in the database before reseeding!
