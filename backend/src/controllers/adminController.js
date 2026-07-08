const db = require('../config/database');
const authService = require('../config/auth');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.executeQuery(
            'SELECT id, username, email, role, full_name, badge_number, department, is_active, last_login, created_at FROM users'
        );

        res.json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, full_name, department, is_active } = req.body;

        const result = await db.executeQuery(
            `UPDATE users SET 
                role = COALESCE(?, role),
                full_name = COALESCE(?, full_name),
                department = COALESCE(?, department),
                is_active = COALESCE(?, is_active),
                updated_at = NOW()
             WHERE id = ?`,
            [role, full_name, department, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'update_user', 'user', id, 
             JSON.stringify({ role, is_active }), req.ip]
        );

        res.json({ message: 'User updated successfully' });

    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const logs = await db.executeQuery(
            `SELECT al.*, u.username 
             FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );

        const total = await db.executeQuery(
            'SELECT COUNT(*) as count FROM audit_logs'
        );

        res.json({
            total: total[0].count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            logs
        });

    } catch (error) {
        console.error('Get Audit Logs Error:', error);
        res.status(500).json({ error: 'Failed to get audit logs' });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        const stats = {};

        // User stats
        const userStats = await db.executeQuery(
            `SELECT role, COUNT(*) as count FROM users GROUP BY role`
        );
        stats.users = userStats;

        // Case stats
        const caseStats = await db.executeQuery(
            `SELECT status, COUNT(*) as count FROM cases GROUP BY status`
        );
        stats.cases = caseStats;

        // Evidence stats
        const evidenceStats = await db.executeQuery(
            `SELECT status, COUNT(*) as count FROM evidence GROUP BY status`
        );
        stats.evidence = evidenceStats;

        // Total counts
        const totals = await db.executeQuery(
            `SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM cases) as total_cases,
                (SELECT COUNT(*) FROM evidence) as total_evidence,
                (SELECT COUNT(*) FROM custody_logs) as total_custody_events`
        );
        stats.totals = totals[0];

        res.json(stats);

    } catch (error) {
        console.error('Get System Stats Error:', error);
        res.status(500).json({ error: 'Failed to get system stats' });
    }
};