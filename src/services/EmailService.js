// EmailService logic in JavaScript
const { mailgunProvider, awsProvider } = require('./providers');
const RateLimiter = require('../services/RateLimiter');
const CircuitBreaker = require('../utils/CircuitBreaker');
const Logger = require('../utils/Logger');

class EmailService {
  constructor() {
    this.sentEmails = new Set(); // idempotency
    this.rateLimiter = new RateLimiter(5, 60 * 1000); // 5 emails per 60s
    this.logger = new Logger();
    this.mailgunCircuit = new CircuitBreaker(3, 10000); // trip after 3 fails, wait 10s
  }

  async send(email) {
    const id = email.idempotencyKey;

    if (this.sentEmails.has(id)) {
      this.logger.log('Duplicate email. Skipping...');
      return { success: false, reason: 'Duplicate email (idempotent)' };
    }

    if (!this.rateLimiter.allow()) {
      this.logger.log('Rate limit exceeded.');
      return { success: false, reason: 'Rate limit exceeded' };
    }

    let result = await this._trySendWithProvider(mailgunProvider, email, this.mailgunCircuit);

    if (!result.success) {
      this.logger.log('Fallback to AWS SES...');
      result = await this._trySendWithProvider(awsProvider, email);
    }

    if (result.success) {
      this.sentEmails.add(id);
    }

    return {
      success: result.success,
      providerUsed: result.provider,
      attempts: result.attempts || 1,
    };
  }

  async _trySendWithProvider(provider, email, circuitBreaker = null) {
    let attempt = 0;
    let delay = 500;

    while (attempt < 3) {
      if (circuitBreaker && !circuitBreaker.allow()) {
        this.logger.log(`${provider.name} circuit is open. Skipping.`);
        return { success: false, provider: provider.name, attempts: attempt };
      }

      try {
        attempt++;
        const res = await provider(email);

        if (res.success) {
          this.logger.log(`Email sent via ${res.provider} ✅`);
          if (circuitBreaker) circuitBreaker.success();
          return { ...res, attempts: attempt };
        } else {
          throw new Error(`${res.provider} failed`);
        }
      } catch (err) {
        this.logger.log(`Attempt ${attempt} failed: ${err.message}`);
        if (circuitBreaker) circuitBreaker.fail();
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2; // exponential backoff
      }
    }

    return { success: false, provider: provider.name, attempts: attempt };
  }
}

module.exports = EmailService;
