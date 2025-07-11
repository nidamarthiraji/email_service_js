// Rate limiter in JS
class RateLimiter {
  constructor(maxPerMinute) {
    this.max = maxPerMinute;
    this.tokens = maxPerMinute;
    this.lastRefill = Date.now();
  }

  allow() {
    const now = Date.now();
    if (now - this.lastRefill > 60000) {
      this.tokens = this.max;
      this.lastRefill = now;
    }

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
}

module.exports = { RateLimiter };

