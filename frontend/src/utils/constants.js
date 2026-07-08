// Location: /frontend/src/utils/constants.js

export const ROLES = {
    ADMIN: 'admin',
    INVESTIGATOR: 'investigator',
    CUSTODIAN: 'custodian',
    ANALYZER: 'analyzer',
    VIEWER: 'viewer'
};

export const EVIDENCE_STATUS = {
    REGISTERED: 'registered',
    STORED: 'stored',
    ANALYZED: 'analyzed',
    TRANSFERRED: 'transferred',
    ARCHIVED: 'archived'
};

export const CASE_STATUS = {
    OPEN: 'open',
    INVESTIGATING: 'investigating',
    CLOSED: 'closed',
    ARCHIVED: 'archived'
};

export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

export const CUSTODY_ACTIONS = {
    REGISTERED: 'registered',
    UPLOADED: 'uploaded',
    STORED: 'stored',
    TRANSFERRED: 'transferred',
    VIEWED: 'viewed',
    ANALYZED: 'analyzed',
    VERIFIED: 'verified',
    ARCHIVED: 'archived'
};

export const FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    TEXT: ['text/plain', 'text/csv'],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed']
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        PROFILE: '/auth/profile'
    },
    EVIDENCE: {
        LIST: '/evidence',
        DETAIL: '/evidence/:id',
        REGISTER: '/evidence/register',
        UPLOAD: '/evidence/upload',
        SEARCH: '/evidence/search',
        VERIFY: '/evidence/:id/verify'
    },
    CUSTODY: {
        TRANSFER: '/custody/transfer',
        TIMELINE: '/custody/timeline/:evidenceId',
        REPORT: '/custody/report/:evidenceId'
    },
    CASES: {
        LIST: '/cases',
        DETAIL: '/cases/:id',
        CREATE: '/cases',
        UPDATE: '/cases/:id',
        CLOSE: '/cases/:id/close'
    },
    ADMIN: {
        USERS: '/admin/users',
        AUDIT_LOGS: '/admin/audit-logs',
        SETTINGS: '/admin/settings',
        STATS: '/admin/stats',
        BACKUP: '/admin/backup'
    }
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',
    NOTIFICATIONS: 'notifications',
    THEME: 'theme',
    LANGUAGE: 'language'
};

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    LIMIT_OPTIONS: [10, 20, 50, 100]
};