const db = require('../../shared/db');

/**
 * Notification Service
 * Dispatches alerts to multiple channels (In-app, WebSocket, Slack-mock).
 */
class NotificationService {
  /**
   * Dispatches a notification to a specific user.
   */
  async notifyUser(userId, type, message, relId = null) {
    try {
      // 1. Persist to Database (In-app inbox)
      await db.notification.create({
        data: {
          userId: parseInt(userId),
          type,
          message,
          relId: relId ? parseInt(relId) : null
        }
      });

      // 2. Broadcast via Socket.io
      // Note: io is attached to app.get('io') in server.js
      // We assume here it's passed or accessible globally
      // For this utility, we'll log the intention
      console.log(`[Notification] [${type}] to User ${userId}: ${message}`);

      // 3. Mock External Channels
      this.dispatchToSlack(userId, message);
      this.dispatchToEmail(userId, message);

      return { success: true };
    } catch (err) {
      console.error('Notification dispatch failed:', err);
      throw err;
    }
  }

  dispatchToSlack(userId, message) {
    console.log(`[MOCK SLACK] Sending to user-channel-${userId}: ${message}`);
  }

  dispatchToEmail(userId, message) {
    console.log(`[MOCK EMAIL] Sending to user-email-${userId}: ${message}`);
  }
}

module.exports = new NotificationService();
