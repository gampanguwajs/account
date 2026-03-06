describe('Security Testing', () => {
  test('SQL injection prevention', async () => {
    const maliciousInput = "' OR '1'='1";
    const response = await request(app)
      .get(`/api/v1/users?email=${maliciousInput}`);
    
    expect(response.status).toBe(400);
    expect(response.body.users).toBeUndefined();
  });

  test('JWT token tampering', async () => {
    const validToken = generateToken({ id: 1 });
    const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
    
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${tamperedToken}`);
    
    expect(response.status).toBe(401);
  });

  test('rate limiting bypass attempts', async () => {
    // Test distributed attacks
    const ips = ['1.1.1.1', '2.2.2.2', '3.3.3.3'];
    const requests = [];

    for (const ip of ips) {
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .set('X-Forwarded-For', ip)
            .send({ email: 'test@example.com', password: 'wrong' })
        );
      }
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBe(20); // 2 per IP should be rate limited
  });
});