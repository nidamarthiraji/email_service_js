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
const EmailService = require('../src/services/EmailService');

describe('EmailService', () => {
  let service;

  beforeEach(() => {
    service = new EmailService();

    // Override providers with mock logic for testing
    service._trySendWithProvider = async (provider, email) => {
      if (email.to === 'fail@example.com') {
        return { success: false, provider: 'MockProvider', attempts: 3 };
      }
      return { success: true, provider: 'MockProvider', attempts: 1 };
    };
  });

  test('should send email successfully using Provider A or fallback to B', async () => {
    const email = {
      to: 'test@example.com',
      subject: 'Hello',
      body: 'This is a test',
      idempotencyKey: 'email-1',
    };

    const result = await service.send(email);
    expect(result.success).toBe(true);
    expect(['MockProvider']).toContain(result.providerUsed);
  });

  test('should prevent duplicate sends (idempotency)', async () => {
    const email = {
      to: 'raji123@gmail.com',
      subject: 'Hi again',
      body: 'Second email',
      idempotencyKey: 'unique-id',
    };

    const first = await service.send(email);
    const second = await service.send(email);

    expect(first.success).toBe(true);
    expect(second.success).toBe(false);
    expect(second.reason).toBe('Duplicate email (idempotent)');
  });

  test('should apply rate limiting after 5 sends', async () => {
    const results = [];

    for (let i = 0; i < 6; i++) {
      const email = {
        to: 'test@example.com',
        subject: `Test ${i}`,
        body: 'Body',
        idempotencyKey: `id-${i}`,
      };
      const result = await service.send(email);
      results.push(result);
    }

    const last = results[5];
    expect(last.success).toBe(false);
    expect(last.reason).toBe('Rate limit exceeded');
  });
});



