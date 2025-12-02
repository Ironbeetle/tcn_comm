# Authentication System Setup Guide

This application uses NextAuth.js with credentials-based authentication, featuring:
- Email/password login
- Role-based access control (STAFF, STAFF_ADMIN, ADMIN, CHIEF_COUNCIL)
- Account lockout after failed attempts
- PIN-based password reset
- Session management with JWT

## Setup Steps

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 3. Create First Admin User

Run the admin creation script:

```bash
npx tsx scripts/create-admin.ts
```

Or manually hash a password and insert into database:

```bash
npx tsx scripts/hash-password.ts
```

Then use Prisma Studio to create the user:
```bash
npx prisma studio
```

### 4. Install Dependencies

Make sure all required packages are installed:

```bash
npm install
```

Key dependencies:
- `next-auth@^4.24.13` - Authentication
- `@prisma/client@^6.18.0` - Database ORM
- `bcrypt@^6.0.0` - Password hashing
- `zod@^4.1.13` - Schema validation
- `react-hook-form@^7.67.0` - Form handling

## Authentication Flow

### Login Process

1. User enters email and password at `/login`
2. NextAuth verifies credentials via the authorize function
3. On success, creates JWT session token
4. User is redirected based on role:
   - STAFF → `/Staff_Home`
   - STAFF_ADMIN → `/Staff_Home`
   - ADMIN → `/Admin_Home`
   - CHIEF_COUNCIL → `/Admin_Home`

### Password Reset Flow

1. User requests reset at `/reset-password`
2. System generates 6-digit PIN (valid for 15 minutes)
3. PIN is logged to console (in production, send via email/SMS)
4. User enters PIN and new password at `/verify-pin`
5. Password is updated and user can login

### Session Management

- Sessions use JWT tokens (24-hour expiration)
- Middleware protects routes requiring authentication
- Role-based access control on specific routes

## User Schema

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  first_name    String
  last_name     String
  department    Department     @default(FRONT_DESK)
  role          UserRole       @default(STAFF)
  
  // Authentication fields
  pin           String?        // 6-digit PIN for password reset
  pinExpiresAt  DateTime?      // PIN expiration time
  lastLogin     DateTime?      // Track last login
  loginAttempts Int           @default(0) // Track failed login attempts
  lockedUntil   DateTime?     // Account lockout until this time
  
  // Password reset tracking
  passwordResetRequested DateTime?
  passwordResetCompleted DateTime?
}
```

## Role Permissions

- **STAFF**: Basic access to staff features
- **STAFF_ADMIN**: Staff features + administrative capabilities
- **ADMIN**: Full system administration
- **CHIEF_COUNCIL**: Highest level access

## Department Types

- FRONT_DESK
- FINANCE
- HOUSING
- OFFICE_ADMIN
- COUNCIL
- SOCIAL_ASSISTANCE

## Security Features

### Account Lockout
- 5 failed login attempts = 30-minute lockout
- Automatic reset on successful login

### PIN Reset System
- 6-digit numeric PIN
- 15-minute expiration
- One-time use

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters recommended

## Protected Routes

The middleware (`middleware.ts`) protects all routes except:
- `/login`
- `/reset-password`
- `/verify-pin`
- `/auth/error`
- API routes
- Static files

## API Routes

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

## Using Authentication in Components

### Client Components

```tsx
"use client"
import { useSession } from "next-auth/react"

export default function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated") return <div>Not logged in</div>
  
  return <div>Hello {session?.user?.first_name}</div>
}
```

### Server Components

```tsx
import { getServerSession } from "next-auth"

export default async function MyPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect("/login")
  }
  
  return <div>Hello {session.user.first_name}</div>
}
```

### Server Actions

```tsx
"use server"
import { getServerSession } from "next-auth"

export async function myAction() {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error("Unauthorized")
  }
  
  // Your action logic
}
```

## Troubleshooting

### "Invalid credentials" on valid login
- Check password is hashed correctly in database
- Verify NEXTAUTH_SECRET is set
- Check database connection

### Redirects not working
- Verify middleware matcher patterns
- Check role names match exactly
- Ensure NEXTAUTH_URL is correct

### Session not persisting
- Clear browser cookies
- Verify NEXTAUTH_SECRET hasn't changed
- Check session.strategy is 'jwt'

## Development vs Production

### Development
- PIN printed to console for password reset
- Debug logging enabled

### Production
- Implement email/SMS for PIN delivery
- Set NODE_ENV=production
- Use secure NEXTAUTH_SECRET
- Enable HTTPS
- Set proper NEXTAUTH_URL

## Next Steps

1. Set up email provider (Resend) for PIN delivery
2. Set up SMS provider (Twilio) for notifications
3. Implement user management UI for admins
4. Add audit logging for authentication events
5. Implement 2FA (optional enhancement)
