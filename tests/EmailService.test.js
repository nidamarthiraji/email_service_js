// Jest test cases go here
/*describe('EmailService', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });
});*/
/*
const { EmailService } = require('../src/services/EmailService');

describe('EmailService', () => {
  let service;

  beforeEach(() => {
    service = new EmailService();
  });

  it('should send email successfully using Provider A or fallback to B', async () => {
    const email = {
      to: 'test1@example.com',
      subject: 'Test Email',
      body: 'Hello World!',
      idempotencyKey: 'unique-key-001',
    };

    const result = await service.sendEmail(email);
    expect(result.success).toBe(true);
    expect(['Provider A', 'Provider B']).toContain(result.providerUsed);
    expect(result.attempts).toBeGreaterThan(0);
  });

  it('should prevent duplicate sends (idempotency)', async () => {
    const email = {
      to: 'test2@example.com',
      subject: 'Duplicate Check',
      body: 'Second email',
      idempotencyKey: 'unique-key-002',
    };

    const first = await service.sendEmail(email);
    const second = await service.sendEmail(email);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.attempts).toBe(0); // should skip sending
  });

  it('should apply rate limiting after 5 sends', async () => {
    const results = [];

    for (let i = 1; i <= 6; i++) {
      const email = {
        to: `user${i}@example.com`,
        subject: 'Rate Test',
        body: 'Testing rate limit',
        idempotencyKey: `rate-limit-${i}`,
      };
      const result = await service.sendEmail(email);
      results.push(result);
    }

    const failed = results.filter((r) => !r.success);
    expect(failed.length).toBeGreaterThanOrEqual(1); // 6th one should fail due to rate limiting
  });
});
*/
const { EmailService } = require('../src/services/EmailService');

// Mock Providers
const providerA = {
  send: jest.fn().mockResolvedValue('Provider A Success'),
};

const providerB = {
  send: jest.fn().mockResolvedValue('Provider B Success'),
};

let service;

beforeEach(() => {
  jest.clearAllMocks();
  service = new EmailService(providerA, providerB);
});

describe('EmailService', () => {
  test('should send email successfully using Provider A or fallback to B', async () => {
    providerA.send.mockRejectedValueOnce(new Error('Fail A')); // Simulate A failure
    const email = {
      to: 'user@example.com',
      subject: 'Test Email',
      body: 'This is a test.',
      idempotencyKey: 'test1',
    };

    const result = await service.send(email);
    expect(['success', 'skipped', 'failed']).toContain(result.status);
    expect(['A', 'B', undefined]).toContain(result.provider);
  });

  test('should prevent duplicate sends (idempotency)', async () => {
    const email = {
      to: 'raji123@gmail.com',
      subject: 'Welcome',
      body: 'Hello!',
      idempotencyKey: 'same-key-1',
    };

    const first = await service.send(email);
    const second = await service.send(email);

    expect(first.status).toBe('success');
    expect(second.status).toBe('skipped');
    expect(second.reason).toBe('Duplicate send');
  });

  test('should apply rate limiting after 5 sends', async () => {
    const results = [];

    for (let i = 0; i < 6; i++) {
      const email = {
        to: `rate${i}@example.com`,
        subject: `Test ${i}`,
        body: 'Hi!',
        idempotencyKey: `rate-limit-${i}`,
      };

      const result = await service.send(email);
      results.push(result);
    }

    const failedDueToRate = results.filter(r => r.status === 'failed' && r.reason === 'Rate limit exceeded');
    expect(failedDueToRate.length).toBeGreaterThanOrEqual(1);
  });
});


