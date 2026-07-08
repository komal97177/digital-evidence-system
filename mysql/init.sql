-- Database initialization script
CREATE DATABASE IF NOT EXISTS evidence_db;
USE evidence_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'investigator', 'custodian', 'analyzer', 'viewer') NOT NULL,
    full_name VARCHAR(100),
    badge_number VARCHAR(20),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    case_type VARCHAR(50),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'investigating', 'closed', 'archived') DEFAULT 'open',
    assigned_officer_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_case_number (case_number),
    INDEX idx_status (status)
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id VARCHAR(50) UNIQUE NOT NULL,
    case_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    sha256_hash VARCHAR(64),
    encryption_key VARCHAR(255),
    metadata JSON,
    status ENUM('registered', 'stored', 'analyzed', 'transferred', 'archived') DEFAULT 'registered',
    collected_by INT,
    collected_date TIMESTAMP,
    storage_location VARCHAR(200),
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_case_id (case_id),
    INDEX idx_status (status),
    INDEX idx_sha256 (sha256_hash)
);

-- Custody logs table
CREATE TABLE IF NOT EXISTS custody_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id INT NOT NULL,
    action ENUM('registered', 'uploaded', 'stored', 'transferred', 'viewed', 'analyzed', 'verified', 'archived') NOT NULL,
    from_user_id INT,
    to_user_id INT,
    from_location VARCHAR(200),
    to_location VARCHAR(200),
    notes TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    hash_before VARCHAR(64),
    hash_after VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evidence (evidence_id),
    INDEX idx_created_at (created_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    status ENUM('success', 'failure') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action)
);

-- Forensic reports table
CREATE TABLE IF NOT EXISTS forensic_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id INT NOT NULL,
    report_number VARCHAR(50) UNIQUE NOT NULL,
    report_type ENUM('metadata', 'integrity', 'comprehensive') DEFAULT 'comprehensive',
    findings TEXT,
    recommendations TEXT,
    file_path VARCHAR(500),
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_evidence (evidence_id)
);

-- Investigation reports table
CREATE TABLE IF NOT EXISTS investigation_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    report_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200),
    summary TEXT,
    findings TEXT,
    conclusions TEXT,
    recommendations TEXT,
    file_path VARCHAR(500),
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_case (case_id)
);

-- Evidence access logs table
CREATE TABLE IF NOT EXISTS evidence_access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id INT NOT NULL,
    user_id INT NOT NULL,
    access_type ENUM('view', 'download', 'transfer', 'analyze') NOT NULL,
    reason VARCHAR(255),
    ip_address VARCHAR(45),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_evidence (evidence_id),
    INDEX idx_user (user_id),
    INDEX idx_accessed_at (accessed_at)
);

-- Insert default admin user (password: Admin@123)
INSERT INTO users 
(username, email, password_hash, role, full_name, badge_number, department) 
VALUES 
('admin', 'admin@evidence.com', '$2b$10$QJ3qKZkQJ3qKZkQJ3qKZkQJ3qKZkQJ3qKZkQJ3qKZkQJ3qKZkQJ3qKZk', 
 'admin', 'System Administrator', 'ADM001', 'IT Security');

-- Insert sample case
INSERT INTO cases 
(case_number, title, description, case_type, priority, status, created_by) 
VALUES 
('CASE-2026-001', 'Financial Cyber Fraud Investigation', 
 'Investigation into unauthorized transactions and data breach', 
 'cyber', 'high', 'open', 1);