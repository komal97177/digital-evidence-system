// Location: /frontend/src/utils/validators.js

/**
 * Validation Utilities
 * Comprehensive validation functions for forms, data, and inputs
 */

class Validators {
    constructor() {
        // Common regex patterns
        this.patterns = {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            phone: /^(\+91)?[6-9]\d{9}$/,
            pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            aadhar: /^\d{4}\s?\d{4}\s?\d{4}$/,
            ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            pinCode: /^[1-9][0-9]{5}$/,
            gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
            ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            ipv6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
            hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            hexHash: /^[a-fA-F0-9]{64}$/,
            uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            base64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            time: /^([01]\d|2[0-3]):([0-5]\d)$/,
            datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
            username: /^[a-zA-Z0-9_]{3,20}$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            evidenceId: /^EVID-[A-Z0-9]{10,}$/,
            caseNumber: /^CASE-\d{4}-[A-Z0-9]{6}$/,
            reportNumber: /^RPT-[A-Z0-9]{10,}$/,
            badgeNumber: /^[A-Z]{2,3}\d{3,6}$/
        };
    }

    /**
     * Validate Email
     */
    isValidEmail(email) {
        if (!email) return false;
        if (email.length > 254) return false;
        return this.patterns.email.test(email);
    }

    /**
     * Validate Phone Number (Indian format)
     */
    isValidPhone(phone) {
        if (!phone) return false;
        return this.patterns.phone.test(phone.replace(/\s/g, ''));
    }

    /**
     * Validate PAN Card
     */
    isValidPAN(pan) {
        if (!pan) return false;
        return this.patterns.pan.test(pan.toUpperCase());
    }

    /**
     * Validate Aadhar Card
     */
    isValidAadhar(aadhar) {
        if (!aadhar) return false;
        return this.patterns.aadhar.test(aadhar);
    }

    /**
     * Validate IFSC Code
     */
    isValidIFSC(ifsc) {
        if (!ifsc) return false;
        return this.patterns.ifsc.test(ifsc.toUpperCase());
    }

    /**
     * Validate PIN Code
     */
    isValidPinCode(pin) {
        if (!pin) return false;
        return this.patterns.pinCode.test(pin);
    }

    /**
     * Validate GST Number
     */
    isValidGST(gst) {
        if (!gst) return false;
        return this.patterns.gst.test(gst.toUpperCase());
    }

    /**
     * Validate URL
     */
    isValidURL(url) {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return this.patterns.url.test(url);
        }
    }

    /**
     * Validate IPv4 Address
     */
    isValidIPv4(ip) {
        if (!ip) return false;
        return this.patterns.ipv4.test(ip);
    }

    /**
     * Validate IPv6 Address
     */
    isValidIPv6(ip) {
        if (!ip) return false;
        return this.patterns.ipv6.test(ip);
    }

    /**
     * Validate Hex Color
     */
    isValidHexColor(color) {
        if (!color) return false;
        return this.patterns.hexColor.test(color);
    }

    /**
     * Validate SHA-256 Hash
     */
    isValidSHA256(hash) {
        if (!hash) return false;
        return this.patterns.hexHash.test(hash);
    }

    /**
     * Validate UUID
     */
    isValidUUID(uuid) {
        if (!uuid) return false;
        return this.patterns.uuid.test(uuid);
    }

    /**
     * Validate Base64
     */
    isValidBase64(str) {
        if (!str) return false;
        return this.patterns.base64.test(str);
    }

    /**
     * Validate Date (YYYY-MM-DD)
     */
    isValidDate(date) {
        if (!date) return false;
        if (!this.patterns.date.test(date)) return false;
        
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Validate Time (HH:MM)
     */
    isValidTime(time) {
        if (!time) return false;
        return this.patterns.time.test(time);
    }

    /**
     * Validate DateTime (ISO)
     */
    isValidDateTime(datetime) {
        if (!datetime) return false;
        if (!this.patterns.datetime.test(datetime)) return false;
        
        const d = new Date(datetime);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Validate Username
     */
    isValidUsername(username) {
        if (!username) return false;
        return this.patterns.username.test(username);
    }

    /**
     * Validate Password (Strong)
     */
    isValidPassword(password) {
        if (!password) return false;
        return this.patterns.password.test(password);
    }

    /**
     * Validate Evidence ID
     */
    isValidEvidenceId(id) {
        if (!id) return false;
        return this.patterns.evidenceId.test(id);
    }

    /**
     * Validate Case Number
     */
    isValidCaseNumber(caseNumber) {
        if (!caseNumber) return false;
        return this.patterns.caseNumber.test(caseNumber);
    }

    /**
     * Validate Report Number
     */
    isValidReportNumber(reportNumber) {
        if (!reportNumber) return false;
        return this.patterns.reportNumber.test(reportNumber);
    }

    /**
     * Validate Badge Number
     */
    isValidBadgeNumber(badge) {
        if (!badge) return false;
        return this.patterns.badgeNumber.test(badge.toUpperCase());
    }

    /**
     * Check if string is empty or whitespace
     */
    isEmptyString(str) {
        return !str || str.trim().length === 0;
    }

    /**
     * Check if object is empty
     */
    isEmptyObject(obj) {
        return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    /**
     * Check if array is empty
     */
    isEmptyArray(arr) {
        return !arr || arr.length === 0;
    }

    /**
     * Validate length between min and max
     */
    isLengthValid(str, min = 0, max = Infinity) {
        if (!str) return min === 0;
        const length = str.length;
        return length >= min && length <= max;
    }

    /**
     * Validate numeric range
     */
    isNumberInRange(num, min = -Infinity, max = Infinity) {
        if (typeof num !== 'number' || isNaN(num)) return false;
        return num >= min && num <= max;
    }

    /**
     * Validate integer
     */
    isInteger(num) {
        return Number.isInteger(num);
    }

    /**
     * Validate positive number
     */
    isPositiveNumber(num) {
        return typeof num === 'number' && num > 0 && !isNaN(num);
    }

    /**
     * Validate non-negative number
     */
    isNonNegativeNumber(num) {
        return typeof num === 'number' && num >= 0 && !isNaN(num);
    }

    /**
     * Validate boolean
     */
    isBoolean(value) {
        return typeof value === 'boolean';
    }

    /**
     * Validate file size
     */
    isValidFileSize(bytes, maxBytes = 524288000) {
        return this.isNonNegativeNumber(bytes) && bytes <= maxBytes;
    }

    /**
     * Validate file type by extension
     */
    isValidFileType(filename, allowedExtensions = []) {
        if (!filename) return false;
        if (allowedExtensions.length === 0) return true;
        
        const ext = filename.split('.').pop().toLowerCase();
        return allowedExtensions.includes(ext);
    }

    /**
     * Validate file type by MIME type
     */
    isValidMimeType(mimeType, allowedMimeTypes = []) {
        if (!mimeType) return false;
        if (allowedMimeTypes.length === 0) return true;
        return allowedMimeTypes.includes(mimeType);
    }

    /**
     * Validate enum value
     */
    isInEnum(value, enumValues) {
        if (!enumValues || !Array.isArray(enumValues)) return false;
        return enumValues.includes(value);
    }

    /**
     * Validate JSON string
     */
    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate all fields in an object with rules
     */
    validateObject(obj, rules) {
        const errors = {};
        let isValid = true;

        for (const [field, rule] of Object.entries(rules)) {
            const value = obj[field];
            const fieldErrors = [];

            // Required check
            if (rule.required && (value === undefined || value === null || value === '')) {
                fieldErrors.push(`${field} is required`);
                isValid = false;
            }

            if (value !== undefined && value !== null && value !== '') {
                // Type check
                if (rule.type) {
                    if (rule.type === 'string' && typeof value !== 'string') {
                        fieldErrors.push(`${field} must be a string`);
                        isValid = false;
                    }
                    if (rule.type === 'number' && typeof value !== 'number') {
                        fieldErrors.push(`${field} must be a number`);
                        isValid = false;
                    }
                    if (rule.type === 'boolean' && typeof value !== 'boolean') {
                        fieldErrors.push(`${field} must be a boolean`);
                        isValid = false;
                    }
                    if (rule.type === 'array' && !Array.isArray(value)) {
                        fieldErrors.push(`${field} must be an array`);
                        isValid = false;
                    }
                    if (rule.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
                        fieldErrors.push(`${field} must be an object`);
                        isValid = false;
                    }
                }

                // Length check
                if (rule.minLength && value.length < rule.minLength) {
                    fieldErrors.push(`${field} must be at least ${rule.minLength} characters`);
                    isValid = false;
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    fieldErrors.push(`${field} must be at most ${rule.maxLength} characters`);
                    isValid = false;
                }

                // Range check
                if (rule.min !== undefined && value < rule.min) {
                    fieldErrors.push(`${field} must be at least ${rule.min}`);
                    isValid = false;
                }
                if (rule.max !== undefined && value > rule.max) {
                    fieldErrors.push(`${field} must be at most ${rule.max}`);
                    isValid = false;
                }

                // Pattern check
                if (rule.pattern && !rule.pattern.test(value)) {
                    fieldErrors.push(`${field} has invalid format`);
                    isValid = false;
                }

                // Enum check
                if (rule.enum && !this.isInEnum(value, rule.enum)) {
                    fieldErrors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
                    isValid = false;
                }

                // Custom validator
                if (rule.validator && typeof rule.validator === 'function') {
                    const result = rule.validator(value);
                    if (result !== true) {
                        fieldErrors.push(result || `${field} failed custom validation`);
                        isValid = false;
                    }
                }
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }

        return {
            isValid,
            errors
        };
    }

    /**
     * Sanitize string (prevent XSS)
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Sanitize object recursively
     */
    sanitizeObject(obj) {
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }
        if (typeof obj === 'object' && obj !== null) {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.sanitizeObject(value);
            }
            return result;
        }
        return obj;
    }

    /**
     * Escape HTML
     */
    escapeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Unescape HTML
     */
    unescapeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }

    /**
     * Validate against XSS patterns
     */
    hasXSS(content) {
        if (typeof content !== 'string') return false;
        const patterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi,
            /<applet[^>]*>/gi,
            /<meta[^>]*>/gi,
            /<link[^>]*>/gi,
            /<style[^>]*>.*?<\/style>/gi
        ];
        return patterns.some(pattern => pattern.test(content));
    }

    /**
     * Validate SQL Injection patterns
     */
    hasSQLInjection(content) {
        if (typeof content !== 'string') return false;
        const patterns = [
            /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|JOIN)\b/gi,
            /--/g,
            /;.*?(SELECT|INSERT|UPDATE|DELETE|DROP)/gi,
            /'OR'.*?'/gi,
            /' AND '/gi
        ];
        return patterns.some(pattern => pattern.test(content));
    }
}

// Create singleton instance
const validators = new Validators();

// Export individual functions for convenience
export const {
    isValidEmail,
    isValidPhone,
    isValidPAN,
    isValidAadhar,
    isValidIFSC,
    isValidPinCode,
    isValidGST,
    isValidURL,
    isValidIPv4,
    isValidIPv6,
    isValidHexColor,
    isValidSHA256,
    isValidUUID,
    isValidBase64,
    isValidDate,
    isValidTime,
    isValidDateTime,
    isValidUsername,
    isValidPassword,
    isValidEvidenceId,
    isValidCaseNumber,
    isValidReportNumber,
    isValidBadgeNumber,
    isEmptyString,
    isEmptyObject,
    isEmptyArray,
    isLengthValid,
    isNumberInRange,
    isInteger,
    isPositiveNumber,
    isNonNegativeNumber,
    isBoolean,
    isValidFileSize,
    isValidFileType,
    isValidMimeType,
    isInEnum,
    isValidJSON,
    validateObject,
    sanitizeString,
    sanitizeObject,
    escapeHTML,
    unescapeHTML,
    hasXSS,
    hasSQLInjection
} = validators;

export default validators;