# Security Documentation

## Authentication Flow

### Password Requirements
- Minimum length: 12 characters
- Must contain: uppercase, lowercase, numbers, special characters
- Cannot contain: username, email prefix, common patterns
- Password history: 5 previous passwords blocked
- Maximum age: 90 days
- Minimum age: 1 day

### Session Management
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Maximum concurrent sessions: 5 per user
- Session invalidation on password change
- Remember me: 30 days with re-authentication

### Two-Factor Authentication
- Methods supported: TOTP (Google Authenticator, Authy)
- Recovery codes: 8 one-time use codes provided
- Rate limiting: 3 attempts per 10 minutes
- Backup methods: Email verification available

## API Security

### Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Password reset: 3 requests per hour per email
- Account creation: 2 per hour per IP

### CORS Configuration