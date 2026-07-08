const db = require('../config/database');

class AuditService {
    /**
     * Log an audit event
     */
    async logEvent(data) {
        try {
            const {
                userId,
                action,
                resourceType,
                resourceId,
                details,
                ipAddress,
                userAgent,
                status = 'success'
            } = data;

            const result = await db.executeQuery(
                `INSERT INTO audit_logs 
                 (user_id, action, resource_type, resource_id, details, ip_address, user_agent, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId || null,
                    action,
                    resourceType || null,
                    resourceId || null,
                    details ? JSON.stringify(details) : null,
                    ipAddress || null,
                    userAgent || null,
                    status
                ]
            );

            return {
                id: result.insertId,
                ...data
            };
        } catch (error) {
            console.error('Audit log error:', error);
            throw error;
        }
    }

    /**
     * Log user login
     */
    async logLogin(userId, username, ipAddress, userAgent, success = true) {
        return this.logEvent({
            userId,
            action: success ? 'login' : 'login_failed',
            resourceType: 'user',
            resourceId: userId,
            details: { username, success },
            ipAddress,
            userAgent,
            status: success ? 'success' : 'failure'
        });
    }

    /**
     * Log user logout
     */
    async logLogout(userId, username, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: 'logout',
            resourceType: 'user',
            resourceId: userId,
            details: { username },
            ipAddress,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log evidence action
     */
    async logEvidenceAction(userId, evidenceId, action, details, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: `evidence_${action}`,
            resourceType: 'evidence',
            resourceId: evidenceId,
            details,
            ipAddress,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log case action
     */
    async logCaseAction(userId, caseId, action, details, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: `case_${action}`,
            resourceType: 'case',
            resourceId: caseId,
            details,
            ipAddress,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log user action
     */
    async logUserAction(userId, targetUserId, action, details, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: `user_${action}`,
            resourceType: 'user',
            resourceId: targetUserId,
            details,
            ipAddress,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log custody transfer
     */
    async logCustodyTransfer(userId, evidenceId, fromUser, toUser, notes, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: 'custody_transfer',
            resourceType: 'evidence',
            resourceId: evidenceId,
            details: {
                from_user: fromUser,
                to_user: toUser,
                notes
            },
            ipAddress,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log integrity verification
     */
    async logIntegrityVerification(userId, evidenceId, verified, hashBefore, hashAfter, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: 'integrity_verification',
            resourceType: 'evidence',
            resourceId: evidenceId,
            details: {
                verified,
                hash_before: hashBefore,
                hash_after: hashAfter
            },
            ipAddress,
            userAgent,
            status: verified ? 'success' : 'failure'
        });
    }

    /**
     * Log system error
     */
    async logError(userId, error, context, ipAddress, userAgent) {
        return this.logEvent({
            userId,
            action: 'system_error',
            resourceType: 'system',
            details: {
                error: error.message,
                stack: error.stack,
                context
            },
            ipAddress,
            userAgent,
            status: 'failure'
        });
    }

    /**
     * Log database query (for debugging)
     */
    async logQuery(userId, query, params, duration, ipAddress, userAgent) {
        if (process.env.NODE_ENV === 'development') {
            return this.logEvent({
                userId,
                action: 'db_query',
                resourceType: 'database',
                details: {
                    query,
                    params,
                    duration: `${duration}ms`
                },
                ipAddress,
                userAgent,
                status: 'success'
            });
        }
        return null;
    }

    /**
     * Get audit logs with filters
     */
    async getAuditLogs(filters = {}) {
        try {
            const {
                userId,
                action,
                resourceType,
                resourceId,
                status,
                startDate,
                endDate,
                limit = 50,
                offset = 0
            } = filters;

            let query = `
                SELECT al.*, u.username 
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (userId) {
                query += ' AND al.user_id = ?';
                params.push(userId);
            }

            if (action) {
                query += ' AND al.action = ?';
                params.push(action);
            }

            if (resourceType) {
                query += ' AND al.resource_type = ?';
                params.push(resourceType);
            }

            if (resourceId) {
                query += ' AND al.resource_id = ?';
                params.push(resourceId);
            }

            if (status) {
                query += ' AND al.status = ?';
                params.push(status);
            }

            if (startDate) {
                query += ' AND al.created_at >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND al.created_at <= ?';
                params.push(endDate);
            }

            query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const logs = await db.executeQuery(query, params);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM audit_logs al
                WHERE 1=1 ${query.includes('WHERE') ? '' : ''}
            `;
            // Simplified count query
            const total = await db.executeQuery(
                'SELECT COUNT(*) as total FROM audit_logs'
            );

            return {
                logs,
                total: total[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            };
        } catch (error) {
            console.error('Get audit logs error:', error);
            throw error;
        }
    }

    /**
     * Get user activity summary
     */
    async getUserActivitySummary(userId) {
        try {
            const summary = await db.executeQuery(
                `SELECT 
                    COUNT(*) as total_actions,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_actions,
                    COUNT(CASE WHEN status = 'failure' THEN 1 END) as failed_actions,
                    MAX(created_at) as last_action
                 FROM audit_logs 
                 WHERE user_id = ?`,
                [userId]
            );

            return summary[0];
        } catch (error) {
            console.error('Get user activity summary error:', error);
            throw error;
        }
    }

    /**
     * Get system activity summary
     */
    async getSystemActivitySummary(timeframe = '24h') {
        try {
            let interval;
            switch (timeframe) {
                case '24h':
                    interval = 'INTERVAL 24 HOUR';
                    break;
                case '7d':
                    interval = 'INTERVAL 7 DAY';
                    break;
                case '30d':
                    interval = 'INTERVAL 30 DAY';
                    break;
                default:
                    interval = 'INTERVAL 24 HOUR';
            }

            const summary = await db.executeQuery(
                `SELECT 
                    COUNT(*) as total_actions,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_actions,
                    COUNT(CASE WHEN status = 'failure' THEN 1 END) as failed_actions,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT action) as unique_actions
                 FROM audit_logs 
                 WHERE created_at > NOW() - ${interval}`
            );

            return summary[0];
        } catch (error) {
            console.error('Get system activity summary error:', error);
            throw error;
        }
    }

    /**
     * Clean up old audit logs
     */
    async cleanupOldLogs(daysToKeep = 90) {
        try {
            const result = await db.executeQuery(
                'DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
                [daysToKeep]
            );
            return {
                deleted: result.affectedRows,
                message: `Deleted ${result.affectedRows} logs older than ${daysToKeep} days`
            };
        } catch (error) {
            console.error('Cleanup old logs error:', error);
            throw error;
        }
    }
}

module.exports = new AuditService();