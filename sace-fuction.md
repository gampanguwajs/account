# API Reference Guide

## Authentication Endpoints

### POST /api/v1/auth/login
Authenticates user credentials and returns session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}