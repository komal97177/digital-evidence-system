const db = require('../config/database');

// Generate unique case number
const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `CASE-${year}-${random}`;
};

exports.createCase = async (req, res) => {
    try {
        const { title, description, case_type, priority, assigned_officer_id } = req.body;

        const case_number = generateCaseNumber();

        const result = await db.executeQuery(
            `INSERT INTO cases (case_number, title, description, case_type, priority, assigned_officer_id, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [case_number, title, description, case_type, priority, assigned_officer_id, req.user.id]
        );

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'create_case', 'case', result.insertId, 
             JSON.stringify({ case_number, title }), req.ip]
        );

        res.status(201).json({
            message: 'Case created successfully',
            case: {
                id: result.insertId,
                case_number,
                title
            }
        });

    } catch (error) {
        console.error('Create Case Error:', error);
        res.status(500).json({ error: 'Failed to create case' });
    }
};

exports.getCases = async (req, res) => {
    try {
        const { status, assigned_to } = req.query;
        
        let query = `
            SELECT c.*, u.username as assigned_officer_name
            FROM cases c
            LEFT JOIN users u ON c.assigned_officer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }

        if (assigned_to) {
            query += ' AND c.assigned_officer_id = ?';
            params.push(assigned_to);
        }

        query += ' ORDER BY c.created_at DESC';

        const cases = await db.executeQuery(query, params);

        res.json({
            count: cases.length,
            cases
        });

    } catch (error) {
        console.error('Get Cases Error:', error);
        res.status(500).json({ error: 'Failed to get cases' });
    }
};

exports.getCaseById = async (req, res) => {
    try {
        const { id } = req.params;

        const cases = await db.executeQuery(
            `SELECT c.*, u.username as assigned_officer_name,
             (SELECT COUNT(*) FROM evidence e WHERE e.case_id = c.id) as evidence_count
             FROM cases c
             LEFT JOIN users u ON c.assigned_officer_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (cases.length === 0) {
            return res.status(404).json({ error: 'Case not found' });
        }

        res.json({ case: cases[0] });

    } catch (error) {
        console.error('Get Case Error:', error);
        res.status(500).json({ error: 'Failed to get case' });
    }
};

exports.updateCase = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assigned_officer_id } = req.body;

        const result = await db.executeQuery(
            `UPDATE cases SET 
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                priority = COALESCE(?, priority),
                assigned_officer_id = COALESCE(?, assigned_officer_id),
                updated_at = NOW()
             WHERE id = ?`,
            [title, description, status, priority, assigned_officer_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Case not found' });
        }

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'update_case', 'case', id, 
             JSON.stringify({ title, status }), req.ip]
        );

        res.json({ message: 'Case updated successfully' });

    } catch (error) {
        console.error('Update Case Error:', error);
        res.status(500).json({ error: 'Failed to update case' });
    }
};

exports.closeCase = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.executeQuery(
            'UPDATE cases SET status = ?, closed_at = NOW(), updated_at = NOW() WHERE id = ?',
            ['closed', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Case not found' });
        }

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'close_case', 'case', id, 
             JSON.stringify({ action: 'case_closed' }), req.ip]
        );

        res.json({ message: 'Case closed successfully' });

    } catch (error) {
        console.error('Close Case Error:', error);
        res.status(500).json({ error: 'Failed to close case' });
    }
};