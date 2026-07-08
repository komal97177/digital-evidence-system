class NotificationService {
    constructor() {
        this.notifications = [];
        this.socketClients = new Map();
    }

    /**
     * Register a socket client
     */
    registerClient(socketId, userId) {
        this.socketClients.set(socketId, userId);
    }

    /**
     * Unregister a socket client
     */
    unregisterClient(socketId) {
        this.socketClients.delete(socketId);
    }

    /**
     * Send notification to a specific user
     */
    async sendToUser(userId, notification) {
        // Store notification
        const notif = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            userId,
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.push(notif);

        // Send via socket if user is connected
        const clients = this.getUserClients(userId);
        for (const socketId of clients) {
            const socket = this.getSocket(socketId);
            if (socket) {
                socket.emit('notification', notif);
            }
        }

        return notif;
    }

    /**
     * Send notification to multiple users
     */
    async sendToMultipleUsers(userIds, notification) {
        const results = [];
        for (const userId of userIds) {
            const result = await this.sendToUser(userId, notification);
            results.push(result);
        }
        return results;
    }

    /**
     * Send notification to all users with a specific role
     */
    async sendToRole(role, notification, userService) {
        const users = await userService.getUsersByRole(role);
        return this.sendToMultipleUsers(
            users.map(u => u.id),
            notification
        );
    }

    /**
     * Send evidence-related notification
     */
    async notifyEvidenceAction(evidenceId, action, userIds, actor, details) {
        const notification = {
            type: 'evidence',
            title: `Evidence ${action}`,
            message: `${actor} ${action} evidence: ${details || ''}`,
            data: {
                evidenceId,
                action,
                actor,
                details
            }
        };
        return this.sendToMultipleUsers(userIds, notification);
    }

    /**
     * Send custody-related notification
     */
    async notifyCustodyTransfer(evidenceId, fromUser, toUser, actor) {
        const notification = {
            type: 'custody',
            title: 'Custody Transfer',
            message: `${actor} transferred custody of evidence ${evidenceId} from ${fromUser} to ${toUser}`,
            data: {
                evidenceId,
                fromUser,
                toUser,
                actor
            }
        };
        return this.sendToMultipleUsers([fromUser, toUser], notification);
    }

    /**
     * Send integrity alert notification
     */
    async notifyIntegrityAlert(evidenceId, userIds, actor, details) {
        const notification = {
            type: 'integrity_alert',
            title: '⚠️ Integrity Alert',
            message: `Integrity check failed for evidence ${evidenceId}`,
            data: {
                evidenceId,
                actor,
                details,
                severity: 'high'
            }
        };
        return this.sendToMultipleUsers(userIds, notification);
    }

    /**
     * Send case update notification
     */
    async notifyCaseUpdate(caseId, action, userIds, actor, details) {
        const notification = {
            type: 'case',
            title: `Case ${action}`,
            message: `${actor} ${action} case: ${details || ''}`,
            data: {
                caseId,
                action,
                actor,
                details
            }
        };
        return this.sendToMultipleUsers(userIds, notification);
    }

    /**
     * Get all notifications for a user
     */
    getUserNotifications(userId, limit = 50) {
        return this.notifications
            .filter(n => n.userId === userId)
            .slice(0, limit);
    }

    /**
     * Get unread notifications for a user
     */
    getUnreadNotifications(userId) {
        return this.notifications
            .filter(n => n.userId === userId && !n.read);
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId, userId) {
        const notification = this.notifications.find(
            n => n.id === notificationId && n.userId === userId
        );
        if (notification) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
            return notification;
        }
        return null;
    }

    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId) {
        const notifications = this.notifications.filter(n => n.userId === userId);
        for (const notification of notifications) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
        }
        return notifications.length;
    }

    /**
     * Delete notification
     */
    deleteNotification(notificationId, userId) {
        const index = this.notifications.findIndex(
            n => n.id === notificationId && n.userId === userId
        );
        if (index !== -1) {
            const deleted = this.notifications.splice(index, 1);
            return deleted[0];
        }
        return null;
    }

    /**
     * Delete all notifications for a user
     */
    deleteAllNotifications(userId) {
        const initialLength = this.notifications.length;
        this.notifications = this.notifications.filter(n => n.userId !== userId);
        return initialLength - this.notifications.length;
    }

    /**
     * Helper methods for socket management
     */
    getUserClients(userId) {
        const clients = [];
        for (const [socketId, clientUserId] of this.socketClients) {
            if (clientUserId === userId) {
                clients.push(socketId);
            }
        }
        return clients;
    }

    setSocket(socketId, socket) {
        this.socketClients.set(socketId, socket);
    }

    getSocket(socketId) {
        return this.socketClients.get(socketId);
    }
}

module.exports = new NotificationService();