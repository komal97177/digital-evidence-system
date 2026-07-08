// Location: /frontend/src/utils/helpers.js

/**
 * Helper Utilities
 * Comprehensive helper functions for common operations
 */

class Helpers {
    constructor() {
        // Cache for expensive operations
        this.cache = new Map();
    }

    /**
     * Generate Unique ID
     */
    generateId(prefix = 'ID') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generate Evidence ID
     */
    generateEvidenceId() {
        return this.generateId('EVID');
    }

    /**
     * Generate Case Number
     */
    generateCaseNumber() {
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `CASE-${year}-${random}`;
    }

    /**
     * Generate Report Number
     */
    generateReportNumber(prefix = 'RPT') {
        return this.generateId(prefix);
    }

    /**
     * Generate Random Password
     */
    generatePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    /**
     * Generate OTP
     */
    generateOTP(length = 6) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits.charAt(Math.floor(Math.random() * 10));
        }
        return otp;
    }

    /**
     * Format Date
     */
    formatDate(date, format = 'MM/DD/YYYY HH:mm') {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        
        const replacements = {
            'YYYY': d.getFullYear(),
            'YY': String(d.getFullYear()).slice(-2),
            'MM': String(d.getMonth() + 1).padStart(2, '0'),
            'M': d.getMonth() + 1,
            'DD': String(d.getDate()).padStart(2, '0'),
            'D': d.getDate(),
            'HH': String(d.getHours()).padStart(2, '0'),
            'H': d.getHours(),
            'mm': String(d.getMinutes()).padStart(2, '0'),
            'm': d.getMinutes(),
            'ss': String(d.getSeconds()).padStart(2, '0'),
            's': d.getSeconds(),
            'SSS': String(d.getMilliseconds()).padStart(3, '0'),
            'AMPM': d.getHours() >= 12 ? 'PM' : 'AM',
            'ampm': d.getHours() >= 12 ? 'pm' : 'am'
        };

        let result = format;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(key, value);
        }
        return result;
    }

    /**
     * Format Date Relative (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        
        const now = new Date();
        const diff = now - d;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;
        if (months < 12) return `${months}mo ago`;
        return `${years}y ago`;
    }

    /**
     * Format File Size
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 Bytes';
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = bytes / Math.pow(k, i);
        
        return `${parseFloat(size.toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Parse File Size from String
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
     * Format Currency
     */
    formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
        if (typeof amount !== 'number') return 'N/A';
        
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(amount);
    }

    /**
     * Format Number
     */
    formatNumber(num, options = {}) {
        if (typeof num !== 'number') return 'N/A';
        
        const {
            style = 'decimal',
            minimumFractionDigits = 0,
            maximumFractionDigits = 2,
            notation = 'standard'
        } = options;
        
        return new Intl.NumberFormat('en-US', {
            style,
            minimumFractionDigits,
            maximumFractionDigits,
            notation
        }).format(num);
    }

    /**
     * Format Percentage
     */
    formatPercentage(value, decimals = 1) {
        if (typeof value !== 'number') return 'N/A';
        return `${(value * 100).toFixed(decimals)}%`;
    }

    /**
     * Truncate Text
     */
    truncateText(text, maxLength = 100, suffix = '...') {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Mask Data
     */
    maskData(data, visibleCount = 4, maskChar = '*') {
        if (!data) return '';
        const str = String(data);
        if (str.length <= visibleCount * 2) return maskChar.repeat(str.length);
        
        const start = str.substring(0, visibleCount);
        const end = str.substring(str.length - visibleCount);
        const masked = maskChar.repeat(str.length - visibleCount * 2);
        
        return start + masked + end;
    }

    /**
     * Mask Email
     */
    maskEmail(email) {
        if (!email) return '';
        const [username, domain] = email.split('@');
        if (username.length <= 3) return email;
        const masked = username.substring(0, 2) + '*'.repeat(username.length - 3) + username.slice(-1);
        return `${masked}@${domain}`;
    }

    /**
     * Mask Phone
     */
    maskPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 4) return phone;
        
        const prefix = cleaned.substring(0, 2);
        const suffix = cleaned.substring(cleaned.length - 2);
        const masked = '*'.repeat(cleaned.length - 4);
        
        return prefix + masked + suffix;
    }

    /**
     * Get Initials from Name
     */
    getInitials(name) {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    /**
     * Generate Random Color
     */
    generateRandomColor() {
        const colors = [
            '#0a1a3a', '#1a3a6a', '#d4a847', '#c41e3a',
            '#2e7d32', '#6b4c3b', '#1a7a7a', '#8b5cf6',
            '#dc2626', '#16a34a', '#2563eb', '#d97706',
            '#7c3aed', '#db2777', '#059669', '#6366f1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get Status Color
     */
    getStatusColor(status, theme = {}) {
        const defaultColors = {
            success: 'bg-green-100 text-green-800 border-green-200',
            error: 'bg-red-100 text-red-800 border-red-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200',
            pending: 'bg-orange-100 text-orange-800 border-orange-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            inProgress: 'bg-blue-100 text-blue-800 border-blue-200',
            archived: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        
        return theme[status] || defaultColors[status] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Deep Clone Object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof RegExp) return new RegExp(obj);
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const [key, value] of Object.entries(obj)) {
            cloned[key] = this.deepClone(value);
        }
        return cloned;
    }

    /**
     * Deep Merge Objects
     */
    deepMerge(target, source) {
        const result = this.deepClone(target);
        
        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = result[key] ? this.deepMerge(result[key], value) : this.deepClone(value);
            } else {
                result[key] = this.deepClone(value);
            }
        }
        
        return result;
    }

    /**
     * Sort Array by Key
     */
    sortByKey(array, key, ascending = true) {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }

    /**
     * Group Array by Key
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
     * Remove Duplicates from Array
     */
    uniqueArray(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        const result = [];
        for (const item of array) {
            const value = item[key];
            if (!seen.has(value)) {
                seen.add(value);
                result.push(item);
            }
        }
        return result;
    }

    /**
     * Paginate Array
     */
    paginateArray(array, page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: array.slice(start, end),
            total: array.length,
            page,
            limit,
            totalPages: Math.ceil(array.length / limit),
            hasNext: end < array.length,
            hasPrev: page > 1
        };
    }

    /**
     * Chunk Array
     */
    chunkArray(array, size = 1) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Pick Object Properties
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
     * Omit Object Properties
     */
    omit(obj, keys) {
        const result = { ...obj };
        for (const key of keys) {
            delete result[key];
        }
        return result;
    }

    /**
     * Sleep/Delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry Async Function
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
     * Debounce Function
     */
    debounce(fn, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Throttle Function
     */
    throttle(fn, limit = 300) {
        let inThrottle = false;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Memoize Function
     */
    memoize(fn, keyFn = null) {
        const cache = new Map();
        return function(...args) {
            const key = keyFn ? keyFn(...args) : JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    /**
     * Check if Object is Empty
     */
    isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        if (typeof obj === 'string') return obj.trim().length === 0;
        return false;
    }

    /**
     * Check if Value is Object
     */
    isObject(value) {
        return value && typeof value === 'object' && !Array.isArray(value);
    }

    /**
     * Check if Value is Array
     */
    isArray(value) {
        return Array.isArray(value);
    }

    /**
     * Check if Value is Function
     */
    isFunction(value) {
        return typeof value === 'function';
    }

    /**
     * Check if Value is String
     */
    isString(value) {
        return typeof value === 'string';
    }

    /**
     * Check if Value is Number
     */
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    /**
     * Check if Value is Date
     */
    isDate(value) {
        return value instanceof Date && !isNaN(value.getTime());
    }

    /**
     * Get Browser Info
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            name: this.getBrowserName(ua),
            version: this.getBrowserVersion(ua),
            platform: navigator.platform,
            language: navigator.language,
            isMobile: /Mobile|Android|iPhone|iPad/i.test(ua),
            isDesktop: !/Mobile|Android|iPhone|iPad/i.test(ua),
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isAndroid: /Android/i.test(ua),
            isChrome: /Chrome/i.test(ua) && !/Edge/i.test(ua),
            isFirefox: /Firefox/i.test(ua),
            isSafari: /Safari/i.test(ua) && !/Chrome/i.test(ua),
            isEdge: /Edge/i.test(ua),
            isIE: /Trident/i.test(ua)
        };
    }

    getBrowserName(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Trident')) return 'Internet Explorer';
        return 'Unknown';
    }

    getBrowserVersion(ua) {
        const match = ua.match(/(Chrome|Firefox|Safari|Edge|MSIE|Trident)\/?\s*(\d+)/);
        return match ? match[2] : 'Unknown';
    }

    /**
     * Get Device Info
     */
    getDeviceInfo() {
        return {
            isMobile: window.innerWidth < 768,
            isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
            isDesktop: window.innerWidth >= 1024,
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    /**
     * Download File
     */
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Download JSON
     */
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    }

    /**
     * Download CSV
     */
    downloadCSV(data, filename, headers = null) {
        if (!data || data.length === 0) {
            this.downloadFile('', filename, 'text/csv');
            return;
        }

        const keys = headers || Object.keys(data[0]);
        const rows = [keys.join(',')];
        
        for (const item of data) {
            const row = keys.map(key => {
                const value = item[key] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            rows.push(row.join(','));
        }
        
        this.downloadFile(rows.join('\n'), filename, 'text/csv');
    }

    /**
     * Copy to Clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return { success: true };
        } catch (error) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return { success: true };
            } catch (err) {
                document.body.removeChild(textarea);
                return { success: false, error: err };
            }
        }
    }

    /**
     * Parse Query String
     */
    parseQueryString(query) {
        if (!query) return {};
        const params = new URLSearchParams(query);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Build Query String
     */
    buildQueryString(params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        }
        return query.toString();
    }

    /**
     * Get URL Parameter
     */
    getUrlParameter(name) {
        const params = this.parseQueryString(window.location.search);
        return params[name] || null;
    }

    /**
     * Update URL Parameter
     */
    updateUrlParameter(key, value) {
        const url = new URL(window.location);
        if (value === null || value === undefined || value === '') {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
        window.history.pushState({}, '', url);
    }

    /**
     * Get Relative Time String
     */
    getRelativeTimeString(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        if (diff < 2592000000) return `${Math.floor(diff / 604800000)} weeks ago`;
        if (diff < 31536000000) return `${Math.floor(diff / 2592000000)} months ago`;
        return `${Math.floor(diff / 31536000000)} years ago`;
    }

    /**
     * Is Today
     */
    isToday(date) {
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    }

    /**
     * Is Yesterday
     */
    isYesterday(date) {
        const d = new Date(date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear();
    }

    /**
     * Is This Week
     */
    isThisWeek(date) {
        const d = new Date(date);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
    }

    /**
     * Get Timezone
     */
    getTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    /**
     * Get Timezone Offset
     */
    getTimezoneOffset() {
        return new Date().getTimezoneOffset();
    }

    /**
     * Convert to Local Time
     */
    toLocalTime(date) {
        const d = new Date(date);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    }

    /**
     * Convert to UTC
     */
    toUTC(date) {
        const d = new Date(date);
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    }
}

// Create singleton instance
const helpers = new Helpers();

// Export individual functions for convenience
export const {
    generateId,
    generateEvidenceId,
    generateCaseNumber,
    generateReportNumber,
    generatePassword,
    generateOTP,
    formatDate,
    formatRelativeTime,
    formatFileSize,
    parseFileSize,
    formatCurrency,
    formatNumber,
    formatPercentage,
    truncateText,
    maskData,
    maskEmail,
    maskPhone,
    getInitials,
    generateRandomColor,
    getStatusColor,
    deepClone,
    deepMerge,
    sortByKey,
    groupByKey,
    uniqueArray,
    paginateArray,
    chunkArray,
    pick,
    omit,
    sleep,
    retry,
    debounce,
    throttle,
    memoize,
    isEmpty,
    isObject,
    isArray,
    isFunction,
    isString,
    isNumber,
    isDate,
    getBrowserInfo,
    getDeviceInfo,
    downloadFile,
    downloadJSON,
    downloadCSV,
    copyToClipboard,
    parseQueryString,
    buildQueryString,
    getUrlParameter,
    updateUrlParameter,
    getRelativeTimeString,
    isToday,
    isYesterday,
    isThisWeek,
    getTimezone,
    getTimezoneOffset,
    toLocalTime,
    toUTC
} = helpers;

export default helpers;