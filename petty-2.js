class CacheManager {
  constructor(redis) {
    this.redis = redis;
    this.ttl = {
      user: 3600,        // 1 hour
      session: 900,      // 15 minutes
      rateLimit: 60,     // 1 minute
      config: 86400      // 24 hours
    };
  }

  async getUser(id) {
    // Try cache first
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss - get from DB
    const user = await database.getUser(id);
    
    // Store in cache
    await this.redis.setex(
      `user:${id}`, 
      this.ttl.user, 
      JSON.stringify(user)
    );
    
    return user;
  }

  async invalidateUser(id) {
    await this.redis.del(`user:${id}`);
    await this.redis.del(`user:${id}:sessions`);
  }
}