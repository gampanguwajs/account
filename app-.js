// Old config
{
  "session": {
    "store": "memory"
  }
}

// New config
{
  "session": {
    "store": "redis",
    "redis": {
      "host": "localhost",
      "port": 6379
    }
  },
  "jwt": {
    "secret": "your-secret",
    "expiresIn": "15m"
  }
}