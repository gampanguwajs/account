class HealthCheck {
  async check() {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkQueue(),
      this.checkDiskSpace(),
      this.checkMemory()
    ]);
    
    const status = checks.every(c => c.healthy) ? 'healthy' : 'degraded';
    
    return {
      status,
      timestamp: new Date().toISOString(),
      checks: checks.reduce((acc, c) => ({...acc, [c.name]: c}), {})
    };
  }
}