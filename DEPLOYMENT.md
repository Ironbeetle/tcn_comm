# TCN_COMM VPS Deployment Guide

This guide deploys TCN_COMM alongside the TCN Portal on the same VPS.

- **Portal**: `localhost:3000` (community members)
- **TCN_COMM**: `localhost:3001` (staff app)

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running
- PM2 installed globally: `npm install -g pm2`
- Nginx installed
- Git access to repository

---

## Step 1: Clone Repository

```bash
cd /var/www
git clone https://github.com/Ironbeetle/tcn_comm.git
cd tcn_comm
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Configure Environment

```bash
# Copy the example env file
cp .env.production.example .env

# Edit with your production values
nano .env
```

**Key settings to update:**

```env
# Database - use your existing PostgreSQL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/msgmanager?schema=msgmanager"

# Auth - MUST be port 3001
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Portal connection - since they're on same server, use localhost
TCN_PORTAL_URL=http://localhost:3000
```

---

## Step 4: Setup Database

If the database doesn't exist yet:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create admin user
npx tsx scripts/create-admin.ts
```

If sharing the database with an existing setup, just generate:

```bash
npx prisma generate
```

---

## Step 5: Build for Production

```bash
npm run build
```

---

## Step 6: Start with PM2

```bash
# Start the app
pm2 start ecosystem.config.js

# Save PM2 process list (survives reboot)
pm2 save

# Setup PM2 to start on boot (if not already done)
pm2 startup
```

**Useful PM2 commands:**

```bash
pm2 status              # Check status
pm2 logs tcn-comm       # View logs
pm2 restart tcn-comm    # Restart app
pm2 stop tcn-comm       # Stop app
pm2 delete tcn-comm     # Remove from PM2
```

---

## Step 7: Configure Nginx

### Option A: Subdomain (Recommended)

```bash
# Copy nginx config
sudo cp nginx.conf.example /etc/nginx/sites-available/tcn-comm

# Edit and adjust domain names
sudo nano /etc/nginx/sites-available/tcn-comm

# Enable site
sudo ln -s /etc/nginx/sites-available/tcn-comm /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Option B: Internal Only (No public access)

Skip nginx config. Access via SSH tunnel:

```bash
# From your local machine
ssh -L 3001:localhost:3001 user@your-vps-ip

# Then open in browser
http://localhost:3001
```

---

## Step 8: SSL Certificate (If using subdomain)

```bash
# Install certbot if not installed
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d staff.yourdomain.com

# Auto-renewal is set up automatically
```

---

## Verification

1. **Check PM2 status:**
   ```bash
   pm2 status
   ```
   Should show `tcn-comm` as `online`

2. **Check app is responding:**
   ```bash
   curl http://localhost:3001
   ```

3. **Check logs for errors:**
   ```bash
   pm2 logs tcn-comm --lines 50
   ```

4. **Test login** at your configured URL

---

## Updating the App

```bash
cd /var/www/tcn-comm

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart tcn-comm
```

---

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs tcn-comm --lines 100

# Common issues:
# - Missing .env file
# - Database connection failed
# - Port already in use
```

### Database connection issues
```bash
# Test database connection
npx prisma db pull

# Check DATABASE_URL in .env
```

### Port already in use
```bash
# Find what's using port 3001
sudo lsof -i :3001

# Kill the process if needed
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Architecture Summary

```
Internet
    │
    ▼
┌─────────────────────────────────────────────┐
│                   Nginx                      │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │ yourdomain.com  │  │ staff.yourdomain │  │
│  │    (Portal)     │  │   (TCN_COMM)     │  │
│  └────────┬────────┘  └────────┬─────────┘  │
└───────────┼────────────────────┼────────────┘
            │                    │
            ▼                    ▼
      localhost:3000       localhost:3001
      ┌──────────┐         ┌──────────┐
      │  Portal  │◄───────►│ TCN_COMM │
      │  (PM2)   │  API    │  (PM2)   │
      └────┬─────┘         └────┬─────┘
           │                    │
           └────────┬───────────┘
                    ▼
              ┌──────────┐
              │ PostgreSQL│
              │  :5432   │
              └──────────┘
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 process configuration |
| `nginx.conf.example` | Nginx reverse proxy config |
| `.env.production.example` | Environment variable template |
| `SIGNUP_FORMS_API.md` | API documentation for portal integration |
