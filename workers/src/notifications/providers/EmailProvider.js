const BaseProvider = require('./BaseProvider');

class EmailProvider extends BaseProvider {
  async send(userId, message) {
    try {
      // Mocking an email network request (e.g., using SendGrid, SES)
      console.log(`[EmailProvider] Sending Email to User ID: ${userId}...`);
      console.log(`[EmailProvider] Body: ${message}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      return { success: false, errorDetails: err.message };
    }
  }
}

module.exports = EmailProvider;
