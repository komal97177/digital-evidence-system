const db = require('../config/database');
const fs = require('fs-extra');
const path = require('path');

class ReportService {
    /**
     * Generate a forensic report for evidence
     */
    async generateForensicReport(evidenceId, generatedBy) {
        try {
            // Get evidence details
            const evidence = await db.executeQuery(
                `SELECT e.*, c.case_number, u.username as collected_by_name
                 FROM evidence e
                 LEFT JOIN cases c ON e.case_id = c.id
                 LEFT JOIN users u ON e.collected_by = u.id
                 WHERE e.id = ?`,
                [evidenceId]
            );

            if (evidence.length === 0) {
                throw new Error('Evidence not found');
            }

            // Get custody timeline
            const timeline = await db.executeQuery(
                `SELECT cl.*, 
                 from_user.username as from_username,
                 to_user.username as to_username
                 FROM custody_logs cl
                 LEFT JOIN users from_user ON cl.from_user_id = from_user.id
                 LEFT JOIN users to_user ON cl.to_user_id = to_user.id
                 WHERE cl.evidence_id = ?
                 ORDER BY cl.created_at ASC`,
                [evidenceId]
            );

            // Get access logs
            const accessLogs = await db.executeQuery(
                `SELECT eal.*, u.username 
                 FROM evidence_access_logs eal
                 LEFT JOIN users u ON eal.user_id = u.id
                 WHERE eal.evidence_id = ?
                 ORDER BY eal.accessed_at DESC`,
                [evidenceId]
            );

            // Generate report number
            const reportNumber = `FR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

            // Create report data
            const reportData = {
                reportNumber,
                evidence: evidence[0],
                custodyTimeline: timeline,
                accessLogs: accessLogs,
                generatedBy,
                generatedAt: new Date().toISOString(),
                summary: this.generateReportSummary(evidence[0], timeline)
            };

            // Save report to database
            const result = await db.executeQuery(
                `INSERT INTO forensic_reports 
                 (evidence_id, report_number, report_type, findings, generated_by) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    evidenceId,
                    reportNumber,
                    'comprehensive',
                    JSON.stringify(reportData, null, 2),
                    generatedBy
                ]
            );

            return {
                id: result.insertId,
                ...reportData
            };
        } catch (error) {
            console.error('Generate forensic report error:', error);
            throw error;
        }
    }

    /**
     * Generate report summary
     */
    generateReportSummary(evidence, timeline) {
        return {
            totalEvents: timeline.length,
            firstRecorded: timeline.length > 0 ? timeline[0].created_at : null,
            lastUpdated: timeline.length > 0 ? timeline[timeline.length - 1].created_at : null,
            custodyChain: timeline.map(t => ({
                action: t.action,
                from: t.from_username,
                to: t.to_username,
                timestamp: t.created_at
            })),
            integrityStatus: this.checkIntegrityStatus(timeline)
        };
    }

    /**
     * Check integrity status from timeline
     */
    checkIntegrityStatus(timeline) {
        const verifications = timeline.filter(t => t.action === 'verified');
        if (verifications.length === 0) {
            return 'never_verified';
        }
        
        const lastVerification = verifications[verifications.length - 1];
        return lastVerification.hash_before === lastVerification.hash_after 
            ? 'verified' 
            : 'compromised';
    }

    /**
     * Generate investigation report for a case
     */
    async generateInvestigationReport(caseId, generatedBy) {
        try {
            // Get case details
            const caseData = await db.executeQuery(
                `SELECT c.*, u.username as assigned_officer_name
                 FROM cases c
                 LEFT JOIN users u ON c.assigned_officer_id = u.id
                 WHERE c.id = ?`,
                [caseId]
            );

            if (caseData.length === 0) {
                throw new Error('Case not found');
            }

            // Get all evidence for case
            const evidence = await db.executeQuery(
                `SELECT * FROM evidence WHERE case_id = ?`,
                [caseId]
            );

            // Get case logs
            const logs = await db.executeQuery(
                `SELECT * FROM audit_logs 
                 WHERE resource_type = 'case' AND resource_id = ?
                 ORDER BY created_at ASC`,
                [caseId]
            );

            // Generate report
            const reportNumber = `IR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
            
            const reportData = {
                reportNumber,
                case: caseData[0],
                evidence,
                logs,
                generatedBy,
                generatedAt: new Date().toISOString(),
                statistics: this.generateCaseStatistics(evidence, logs)
            };

            // Save to database
            const result = await db.executeQuery(
                `INSERT INTO investigation_reports 
                 (case_id, report_number, title, findings, generated_by) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    caseId,
                    reportNumber,
                    `Investigation Report - ${caseData[0].case_number}`,
                    JSON.stringify(reportData, null, 2),
                    generatedBy
                ]
            );

            return {
                id: result.insertId,
                ...reportData
            };
        } catch (error) {
            console.error('Generate investigation report error:', error);
            throw error;
        }
    }

    /**
     * Generate case statistics
     */
    generateCaseStatistics(evidence, logs) {
        return {
            totalEvidence: evidence.length,
            evidenceByStatus: this.groupByStatus(evidence),
            totalActions: logs.length,
            timeline: logs.map(l => ({
                action: l.action,
                timestamp: l.created_at,
                user: l.user_id
            }))
        };
    }

    /**
     * Group evidence by status
     */
    groupByStatus(evidence) {
        const groups = {};
        for (const item of evidence) {
            const status = item.status || 'unknown';
            groups[status] = (groups[status] || 0) + 1;
        }
        return groups;
    }

    /**
     * Export report as JSON
     */
    async exportReportJSON(reportData, filePath) {
        await fs.writeJson(filePath, reportData, { spaces: 2 });
        return filePath;
    }

    /**
     * Export report as CSV (for data analysis)
     */
    async exportReportCSV(reportData, filePath) {
        // Simple CSV export for timeline data
        let csv = 'Action,From,To,Timestamp\n';
        if (reportData.custodyTimeline) {
            for (const item of reportData.custodyTimeline) {
                csv += `${item.action},${item.from_username || 'N/A'},${item.to_username || 'N/A'},${item.created_at}\n`;
            }
        }
        await fs.writeFile(filePath, csv);
        return filePath;
    }

    /**
     * Get report by ID
     */
    async getReport(reportId) {
        try {
            const report = await db.executeQuery(
                'SELECT * FROM forensic_reports WHERE id = ?',
                [reportId]
            );
            return report[0] || null;
        } catch (error) {
            console.error('Get report error:', error);
            throw error;
        }
    }

    /**
     * Get all reports for evidence
     */
    async getReportsForEvidence(evidenceId) {
        try {
            const reports = await db.executeQuery(
                'SELECT * FROM forensic_reports WHERE evidence_id = ? ORDER BY generated_at DESC',
                [evidenceId]
            );
            return reports;
        } catch (error) {
            console.error('Get reports error:', error);
            throw error;
        }
    }

    /**
     * Verify report integrity
     */
    async verifyReport(reportId, verifierId) {
        try {
            await db.executeQuery(
                'UPDATE forensic_reports SET verified_by = ?, verified_at = NOW() WHERE id = ?',
                [verifierId, reportId]
            );
            return { message: 'Report verified successfully' };
        } catch (error) {
            console.error('Verify report error:', error);
            throw error;
        }
    }
}

module.exports = new ReportService();