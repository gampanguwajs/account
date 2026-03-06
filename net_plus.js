class MultiLevelCache {
  constructor() {
    this.l1Cache = new Map(); // In-memory
    this.l2Cache = redis;      // Redis
    this.ttl = {
      l1: 60000,     // 1 minute
      l2: 3600000    // 1 hour
    };
  }

  async get(key, fetcher) {
    // Try L1 cache (memory)
    let value = this.l1Cache.get(key);
    if (value) {
      return value;
    }

    // Try L2 cache (Redis)
    value = await this.l2Cache.get(key);
    if (value) {
      // Populate L1 cache
      this.l1Cache.set(key, value);
      setTimeout(() => this.l1Cache.delete(key), this.ttl.l1);
      return value;
    }

    // Cache miss - fetch data
    value = await fetcher();
    
    // Populate both caches
    await this.l2Cache.setex(key, this.ttl.l2 / 1000, value);
    this.l1Cache.set(key, value);
    setTimeout(() => this.l1Cache.delete(key), this.ttl.l1);
    
    return value;
  }
}