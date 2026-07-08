const crypto = require('crypto');

class Helpers {
    /**
     * Generate unique ID with prefix
     */
    generateId(prefix = 'ID') {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Generate evidence ID
     */
    generateEvidenceId() {
        return this.generateId('EVID');
    }

    /**
     * Generate case number
     */
    generateCaseNumber() {
        const year = new Date().getFullYear();
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        return `CASE-${year}-${random}`;
    }

    /**
     * Generate report number
     */
    generateReportNumber(prefix = 'RPT') {
        return this.generateId(prefix);
    }

    /**
     * Format date to ISO string
     */
    formatDate(date) {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString();
    }

    /**
     * Format date to local string
     */
    formatDateLocal(date, format = 'MM/DD/YYYY HH:mm') {
        if (!date) return null;
        const d = new Date(date);
        
        const replacements = {
            'YYYY': d.getFullYear(),
            'MM': String(d.getMonth() + 1).padStart(2, '0'),
            'DD': String(d.getDate()).padStart(2, '0'),
            'HH': String(d.getHours()).padStart(2, '0'),
            'mm': String(d.getMinutes()).padStart(2, '0'),
            'ss': String(d.getSeconds()).padStart(2, '0'),
        };

        let result = format;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(key, value);
        }
        return result;
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Parse file size from string (e.g., "10MB" -> 10485760)
     */
    parseFileSize(sizeString) {
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024
        };

        const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*([A-Z]+)$/i);
        if (!match) return null;

        const size = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        
        if (!units[unit]) return null;
        
        return size * units[unit];
    }

    /**
     * Truncate text
     */
    truncateText(text, maxLength = 100, suffix = '...') {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + suffix;
    }

    /**
     * Mask sensitive data
     */
    maskData(data, visibleCount = 4) {
        if (!data) return '';
        const str = String(data);
        if (str.length <= visibleCount * 2) return '*'.repeat(str.length);
        return str.substring(0, visibleCount) + '*'.repeat(str.length - visibleCount * 2) + str.substring(str.length - visibleCount);
    }

    /**
     * Get IP address from request
     */
    getClientIP(req) {
        return req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket.remoteAddress ||
               '127.0.0.1';
    }

    /**
     * Get user agent from request
     */
    getUserAgent(req) {
        return req.headers['user-agent'] || 'unknown';
    }

    /**
     * Deep clone object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Merge objects deeply
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.deepMerge(result[key] || {}, value);
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }

    /**
     * Sort array by key
     */
    sortByKey(array, key, ascending = true) {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }

    /**
     * Group array by key
     */
    groupByKey(array, key) {
        const groups = {};
        for (const item of array) {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        }
        return groups;
    }

    /**
     * Remove duplicates from array
     */
    uniqueArray(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }

    /**
     * Paginate array
     */
    paginateArray(array, page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: array.slice(start, end),
            total: array.length,
            page,
            totalPages: Math.ceil(array.length / limit)
        };
    }

    /**
     * Sleep/delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry async function
     */
    async retry(fn, maxAttempts = 3, delay = 1000) {
        let lastError;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < maxAttempts - 1) {
                    await this.sleep(delay * Math.pow(2, i));
                }
            }
        }
        throw lastError;
    }

    /**
     * Check if object is empty
     */
    isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        if (typeof obj === 'string') return obj.trim().length === 0;
        return false;
    }

    /**
     * Get object keys as array with proper typing
     */
    objectKeys(obj) {
        return Object.keys(obj);
    }

    /**
     * Pick specific keys from object
     */
    pick(obj, keys) {
        const result = {};
        for (const key of keys) {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        }
        return result;
    }

    /**
     * Omit specific keys from object
     */
    omit(obj, keys) {
        const result = { ...obj };
        for (const key of keys) {
            delete result[key];
        }
        return result;
    }
}

module.exports = new Helpers();