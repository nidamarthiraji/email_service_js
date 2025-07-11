class CircuitBreaker {
  constructor(failureThreshold, recoveryTime) {
    this.failureThreshold = failureThreshold;
    this.recoveryTime = recoveryTime;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.open = false;
  }

  allow() {
    if (!this.open) return true;

    const now = Date.now();
    if (now - this.lastFailureTime >= this.recoveryTime) {
      this.open = false;
      this.failureCount = 0;
      return true;
    }

    return false;
  }

  success() {
    this.failureCount = 0;
    this.open = false;
  }

  fail() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.open = true;
    }
  }
}

module.exports = CircuitBreaker;
