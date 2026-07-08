const db = require('../config/database');

exports.transferCustody = async (req, res) => {
    try {
        const { evidence_id, to_user_id, notes } = req.body;

        const evidence = await db.executeQuery(
            'SELECT * FROM evidence WHERE id = ?',
            [evidence_id]
        );

        if (evidence.length === 0) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        const targetUser = await db.executeQuery(
            'SELECT id, username FROM users WHERE id = ? AND is_active = TRUE',
            [to_user_id]
        );

        if (targetUser.length === 0) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        await db.executeQuery(
            `INSERT INTO custody_logs (evidence_id, action, from_user_id, to_user_id, notes, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [evidence_id, 'transferred', req.user.id, to_user_id, notes || 'Custody transferred', req.ip]
        );

        await db.executeQuery(
            'UPDATE evidence SET status = ?, updated_at = NOW() WHERE id = ?',
            ['transferred', evidence_id]
        );

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'transfer_custody', 'evidence', evidence_id,
             JSON.stringify({ from: req.user.id, to: to_user_id, notes }), req.ip]
        );

        res.json({
            message: 'Custody transferred successfully',
            transfer: {
                evidence_id,
                from: req.user.username,
                to: targetUser[0].username,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Transfer Custody Error:', error);
        res.status(500).json({ error: 'Failed to transfer custody' });
    }
};

exports.getCustodyTimeline = async (req, res) => {
    try {
        const { evidence_id } = req.params;

        const timeline = await db.executeQuery(
            `SELECT cl.*, 
             from_user.username as from_username,
             to_user.username as to_username
             FROM custody_logs cl
             LEFT JOIN users from_user ON cl.from_user_id = from_user.id
             LEFT JOIN users to_user ON cl.to_user_id = to_user.id
             WHERE cl.evidence_id = ?
             ORDER BY cl.created_at ASC`,
            [evidence_id]
        );

        res.json({
            evidence_id,
            total_events: timeline.length,
            timeline
        });

    } catch (error) {
        console.error('Get Custody Timeline Error:', error);
        res.status(500).json({ error: 'Failed to get custody timeline' });
    }
};

exports.getCustodyReport = async (req, res) => {
    try {
        const { evidence_id } = req.params;

        const evidence = await db.executeQuery(
            `SELECT e.*, c.case_number, u.username as collected_by_name
             FROM evidence e
             LEFT JOIN cases c ON e.case_id = c.id
             LEFT JOIN users u ON e.collected_by = u.id
             WHERE e.id = ?`,
            [evidence_id]
        );

        if (evidence.length === 0) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        const timeline = await db.executeQuery(
            `SELECT cl.*, 
             from_user.username as from_username,
             to_user.username as to_username
             FROM custody_logs cl
             LEFT JOIN users from_user ON cl.from_user_id = from_user.id
             LEFT JOIN users to_user ON cl.to_user_id = to_user.id
             WHERE cl.evidence_id = ?
             ORDER BY cl.created_at ASC`,
            [evidence_id]
        );

        const accessLogs = await db.executeQuery(
            `SELECT eal.*, u.username 
             FROM evidence_access_logs eal
             LEFT JOIN users u ON eal.user_id = u.id
             WHERE eal.evidence_id = ?
             ORDER BY eal.accessed_at DESC`,
            [evidence_id]
        );

        res.json({
            evidence: evidence[0],
            custody_timeline: timeline,
            access_history: accessLogs,
            report_generated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get Custody Report Error:', error);
        res.status(500).json({ error: 'Failed to get custody report' });
    }
};