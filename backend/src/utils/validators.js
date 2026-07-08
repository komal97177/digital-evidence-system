class Validators {
    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password (min 8 chars, at least 1 number, 1 uppercase, 1 lowercase)
     */
    isValidPassword(password) {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    }

    /**
     * Validate username (alphanumeric, 3-20 chars)
     */
    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    /**
     * Validate evidence ID format
     */
    isValidEvidenceId(evidenceId) {
        const idRegex = /^EVID-[A-Z0-9]{10,}$/;
        return idRegex.test(evidenceId);
    }

    /**
     * Validate case number format
     */
    isValidCaseNumber(caseNumber) {
        const caseRegex = /^CASE-\d{4}-[A-Z0-9]{6}$/;
        return caseRegex.test(caseNumber);
    }

    /**
     * Validate file size
     */
    isValidFileSize(bytes, maxBytes = 524288000) {
        return bytes <= maxBytes;
    }

    /**
     * Validate file type by extension
     */
    isValidFileType(filename, allowedTypes = []) {
        if (allowedTypes.length === 0) return true;
        const ext = filename.split('.').pop().toLowerCase();
        return allowedTypes.includes(ext);
    }

    /**
     * Validate mime type
     */
    isValidMimeType(mimeType, allowedMimeTypes = []) {
        if (allowedMimeTypes.length === 0) return true;
        return allowedMimeTypes.includes(mimeType);
    }

    /**
     * Validate date format (ISO)
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Validate phone number
     */
    isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-]{10,15}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate URL
     */
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate UUID
     */
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Validate SHA-256 hash
     */
    isValidSHA256(hash) {
        const hashRegex = /^[a-f0-9]{64}$/i;
        return hashRegex.test(hash);
    }

    /**
     * Validate role
     */
    isValidRole(role) {
        const validRoles = ['admin', 'investigator', 'custodian', 'analyzer', 'viewer'];
        return validRoles.includes(role);
    }

    /**
     * Validate status
     */
    isValidEvidenceStatus(status) {
        const validStatuses = ['registered', 'stored', 'analyzed', 'transferred', 'archived'];
        return validStatuses.includes(status);
    }

    /**
     * Validate case status
     */
    isValidCaseStatus(status) {
        const validStatuses = ['open', 'investigating', 'closed', 'archived'];
        return validStatuses.includes(status);
    }

    /**
     * Validate priority
     */
    isValidPriority(priority) {
        const validPriorities = ['low', 'medium', 'high', 'critical'];
        return validPriorities.includes(priority);
    }

    /**
     * Validate input string (not empty, min/max length)
     */
    validateString(input, minLength = 1, maxLength = 255) {
        if (typeof input !== 'string') return false;
        if (input.trim().length < minLength) return false;
        if (input.length > maxLength) return false;
        return true;
    }

    /**
     * Validate number
     */
    validateNumber(input, min = -Infinity, max = Infinity) {
        if (typeof input !== 'number') return false;
        if (isNaN(input)) return false;
        if (input < min) return false;
        if (input > max) return false;
        return true;
    }

    /**
     * Validate boolean
     */
    isValidBoolean(value) {
        return typeof value === 'boolean';
    }

    /**
     * Validate array
     */
    isValidArray(value) {
        return Array.isArray(value);
    }

    /**
     * Validate object
     */
    isValidObject(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    /**
     * Sanitize input (prevent XSS)
     */
    sanitize(input) {
        if (typeof input === 'string') {
            return input
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
        return input;
    }

    /**
     * Validate all fields in an object
     */
    validateObject(obj, rules) {
        const errors = {};
        let isValid = true;

        for (const [field, rule] of Object.entries(rules)) {
            const value = obj[field];
            
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors[field] = `${field} is required`;
                isValid = false;
                continue;
            }

            if (value !== undefined && value !== null) {
                if (rule.type && typeof value !== rule.type) {
                    errors[field] = `${field} must be of type ${rule.type}`;
                    isValid = false;
                }

                if (rule.min !== undefined && value < rule.min) {
                    errors[field] = `${field} must be at least ${rule.min}`;
                    isValid = false;
                }

                if (rule.max !== undefined && value > rule.max) {
                    errors[field] = `${field} must be at most ${rule.max}`;
                    isValid = false;
                }

                if (rule.pattern && !rule.pattern.test(value)) {
                    errors[field] = `${field} has invalid format`;
                    isValid = false;
                }

                if (rule.enum && !rule.enum.includes(value)) {
                    errors[field] = `${field} must be one of: ${rule.enum.join(', ')}`;
                    isValid = false;
                }
            }
        }

        return {
            isValid,
            errors
        };
    }
}

module.exports = new Validators();