// EmailService logic in JavaScript
const { RateLimiter } = require('./RateLimiter');
const { Logger } = require('../utils/Logger');
const { CircuitBreaker } = require('../utils/CircuitBreaker');

class EmailService {
  constructor(providerA, providerB) {
    this.providerA = providerA;
    this.providerB = providerB;
    // idempotency
    this.sentEmails = new Set(); 
    // 5 emails per 60 seconds
    this.rateLimiter = new RateLimiter(5, 60 * 1000); 
    this.logger = new Logger();
    // fail 3 times → pause 10s
    this.providerACircuit = new CircuitBreaker(3, 10000); 
  }

  async send(email) {
    const key = `${email.to}-${email.subject}`;
    
    // Idempotency check
    if (this.sentEmails.has(key)) {
      this.logger.log('Duplicate email detected. Skipping...');
      return { status: 'skipped', reason: 'Duplicate send' };
    }

    // Rate limit check
    if (!this.rateLimiter.allow()) {
      this.logger.log('Rate limit exceeded.');
      return { status: 'failed', reason: 'Rate limit exceeded' };
    }

    // Try Provider A with Circuit Breaker
    try {
      await this.tryWithRetry(() =>
        this.providerACircuit.exec(() => this.providerA.send(email)),
        3
      );
      this.sentEmails.add(key);
      this.logger.log('Email sent successfully using Provider A');
      return { status: 'success', provider: 'A' };
    } catch (errorA) {
      this.logger.log('Provider A failed. Trying Provider B...');

      //  Try Provider B with normal retry
      try {
        await this.tryWithRetry(() => this.providerB.send(email), 2);
        this.sentEmails.add(key);
        this.logger.log('Email sent successfully using Provider B');
        return { status: 'success', provider: 'B' };
      } catch (errorB) {
        this.logger.log('Both providers failed.');
        return { status: 'failed', reason: 'All providers failed' };
      }
    }
  }

  //  Retry logic with exponential backoff
  async tryWithRetry(fn, retries) {
    let delay = 100;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await this.sleep(delay);
        // exponential backoff
        delay *= 2; 
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { EmailService };
