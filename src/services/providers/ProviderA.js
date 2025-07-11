// MockProviderA JS
class ProviderA {
  async send(email) {
    const success = Math.random() > 0.3;
    console.log(`[Provider A] Email to ${email.to}: ${success ? 'Success' : 'Fail'}`);
    return success;
  }
}

module.exports = { ProviderA };

