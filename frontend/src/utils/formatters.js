// Location: /frontend/src/utils/formatters.js
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'PPP') => {
    if (!date) return 'N/A';
    try {
        return format(new Date(date), formatStr);
    } catch {
        return 'N/A';
    }
};

export const formatDateTime = (date) => {
    return formatDate(date, 'PPpp');
};

export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
        return 'N/A';
    }
};

export const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
};

export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 3) return email;
    return `${username.substring(0, 2)}***@${domain}`;
};

export const maskPhone = (phone) => {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return `${phone.substring(0, 2)}****${phone.substring(phone.length - 2)}`;
};

export const getInitials = (name) => {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const toTitleCase = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generateId = (prefix = 'ID') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

export const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

export const safeJSONParse = (str, defaultValue = null) => {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
};