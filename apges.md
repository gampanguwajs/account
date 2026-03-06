# Deployment Guide

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 7.x (for session management)
- Nginx 1.22+ (reverse proxy)
- 2GB RAM minimum, 4GB recommended
- Ubuntu 22.04 LTS (recommended)

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://api.yourapp.com
CLIENT_URL=https://app.yourapp.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=account_system
DB_USER=app_user
DB_PASSWORD=secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_SSL=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
REDIS_DB=0

# Authentication
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=another_super_secret_key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
BCRYPT_ROUNDS=12

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_specific_password
EMAIL_FROM=noreply@yourapp.com

# Security
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://app.yourapp.com
SESSION_SECRET=session_secret_key
CSRF_SECRET=csrf_secret_key

# External Services
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
SENTRY_DSN=your_sentry_dsn