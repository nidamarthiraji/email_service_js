// ProviderB JS
class ProviderB {
  async send(email) {
    const success = Math.random() > 0.5;
    console.log(`[Provider B] Email to ${email.to}: ${success ? 'Success' : 'Fail'}`);
    return success;
  }
}

module.exports = { ProviderB };

