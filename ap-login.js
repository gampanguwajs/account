// Old API (v1)
POST /login
{ "username": "user", "password": "pass" }

// New API (v2)
POST /api/v2/auth/login
Headers: { "X-API-Key": "your-api-key" }
{ "email": "user@example.com", "password": "pass" }