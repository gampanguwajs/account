class MetricsCollector {
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      activeUsers: 0
    };
  }

  recordRequest(path, statusCode, duration) {
    this.metrics.requestCount++;
    this.metrics.responseTime.push(duration);
    
    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }
    
    // Send to monitoring service
    this.sendToPrometheus({
      name: 'http_requests_total',
      value: 1,
      labels: { path, status: statusCode }
    });
  }
}