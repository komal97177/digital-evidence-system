const db = require('../config/database');
const encryptionService = require('../config/encryption');
const fs = require('fs-extra');
const path = require('path');

// Generate unique evidence ID
const generateEvidenceId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `EVID-${timestamp}-${random}`.toUpperCase();
};

exports.registerEvidence = async (req, res) => {
    try {
        const { case_id, title, description, collected_date, storage_location } = req.body;

        const cases = await db.executeQuery('SELECT * FROM cases WHERE id = ?', [case_id]);
        if (cases.length === 0) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const evidence_id = generateEvidenceId();

        const result = await db.executeQuery(
            `INSERT INTO evidence (evidence_id, case_id, title, description, status, collected_by, collected_date, storage_location) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [evidence_id, case_id, title, description, 'registered', req.user.id, collected_date, storage_location]
        );

        await db.executeQuery(
            `INSERT INTO custody_logs (evidence_id, action, from_user_id, to_user_id, notes, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [result.insertId, 'registered', req.user.id, req.user.id, 
             `Evidence registered by ${req.user.username}`, req.ip]
        );

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'register_evidence', 'evidence', result.insertId, 
             JSON.stringify({ evidence_id, title, case_id }), req.ip]
        );

        res.status(201).json({
            message: 'Evidence registered successfully',
            evidence: {
                id: result.insertId,
                evidence_id,
                case_id,
                title
            }
        });

    } catch (error) {
        console.error('Register Evidence Error:', error);
        res.status(500).json({ error: 'Failed to register evidence' });
    }
};

exports.uploadEvidence = async (req, res) => {
    try {
        const { evidence_id } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const evidence = await db.executeQuery('SELECT * FROM evidence WHERE id = ?', [evidence_id]);
        if (evidence.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Evidence not found' });
        }

        const evidenceData = evidence[0];
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;

        const sha256Hash = await encryptionService.calculateFileSHA256(filePath);
        const encryptionKey = encryptionService.generateEncryptionKey();
        const encryptedPath = filePath + '.enc';

        await encryptionService.encryptFile(filePath, encryptedPath);
        fs.unlinkSync(filePath);

        await db.executeQuery(
            `UPDATE evidence SET 
                file_name = ?, 
                file_path = ?, 
                file_size = ?, 
                mime_type = ?,
                sha256_hash = ?,
                encryption_key = ?,
                is_encrypted = TRUE,
                status = 'stored',
                updated_at = NOW()
             WHERE id = ?`,
            [fileName, encryptedPath, fileSize, mimeType, sha256Hash, encryptionKey, evidence_id]
        );

        await db.executeQuery(
            `INSERT INTO custody_logs (evidence_id, action, from_user_id, to_user_id, notes, hash_before, hash_after, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [evidence_id, 'uploaded', req.user.id, req.user.id, 
             `File uploaded: ${fileName}`, null, sha256Hash, req.ip]
        );

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'upload_evidence', 'evidence', evidence_id, 
             JSON.stringify({ file_name: fileName, size: fileSize, hash: sha256Hash }), req.ip]
        );

        res.json({
            message: 'Evidence uploaded successfully',
            data: {
                id: evidence_id,
                file_name: fileName,
                file_size: fileSize,
                sha256_hash: sha256Hash,
                encrypted: true
            }
        });

    } catch (error) {
        console.error('Upload Evidence Error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload evidence' });
    }
};

exports.getEvidence = async (req, res) => {
    try {
        const { case_id, status, search } = req.query;
        
        let query = `
            SELECT e.*, u.username as collected_by_name, c.case_number 
            FROM evidence e
            LEFT JOIN users u ON e.collected_by = u.id
            LEFT JOIN cases c ON e.case_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (case_id) {
            query += ' AND e.case_id = ?';
            params.push(case_id);
        }

        if (status) {
            query += ' AND e.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (e.title LIKE ? OR e.evidence_id LIKE ? OR e.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY e.created_at DESC';

        const evidence = await db.executeQuery(query, params);

        res.json({
            count: evidence.length,
            evidence
        });

    } catch (error) {
        console.error('Get Evidence Error:', error);
        res.status(500).json({ error: 'Failed to get evidence' });
    }
};

exports.getEvidenceById = async (req, res) => {
    try {
        const { id } = req.params;

        const evidence = await db.executeQuery(
            `SELECT e.*, u.username as collected_by_name, c.case_number, c.title as case_title
             FROM evidence e
             LEFT JOIN users u ON e.collected_by = u.id
             LEFT JOIN cases c ON e.case_id = c.id
             WHERE e.id = ?`,
            [id]
        );

        if (evidence.length === 0) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        await db.executeQuery(
            `INSERT INTO evidence_access_logs (evidence_id, user_id, access_type, ip_address) 
             VALUES (?, ?, ?, ?)`,
            [id, req.user.id, 'view', req.ip]
        );

        res.json({ evidence: evidence[0] });

    } catch (error) {
        console.error('Get Evidence Error:', error);
        res.status(500).json({ error: 'Failed to get evidence' });
    }
};

exports.verifyIntegrity = async (req, res) => {
    try {
        const { id } = req.params;

        const evidence = await db.executeQuery(
            'SELECT id, evidence_id, file_path, sha256_hash FROM evidence WHERE id = ?',
            [id]
        );

        if (evidence.length === 0) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        const ev = evidence[0];
        
        if (!ev.file_path || !fs.existsSync(ev.file_path)) {
            return res.status(400).json({ 
                error: 'File not found on server',
                integrity: false
            });
        }

        const currentHash = await encryptionService.calculateFileSHA256(ev.file_path);
        const isIntegrity = currentHash === ev.sha256_hash;

        await db.executeQuery(
            `INSERT INTO custody_logs (evidence_id, action, from_user_id, to_user_id, notes, hash_before, hash_after, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, 'verified', req.user.id, req.user.id, 
             `Integrity verification: ${isIntegrity ? 'PASSED' : 'FAILED'}`,
             ev.sha256_hash, currentHash, req.ip]
        );

        res.json({
            evidence_id: ev.evidence_id,
            integrity: isIntegrity,
            expected_hash: ev.sha256_hash,
            current_hash: currentHash,
            verified_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Verify Integrity Error:', error);
        res.status(500).json({ error: 'Failed to verify integrity' });
    }
};