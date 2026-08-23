class BaseProvider {
  /**
   * Abstract method to send a notification.
   * Must return { success: true/false, errorDetails: string }
   */
  async send(userId, message) {
    throw new Error('Method send() must be implemented by concrete provider');
  }
}

module.exports = BaseProvider;
