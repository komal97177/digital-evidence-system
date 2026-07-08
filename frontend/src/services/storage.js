// Location: /frontend/src/services/storage.js
class StorageService {
    constructor() {
        this.prefix = 'evidence_';
        this.encryptionKey = null;
        this.storage = localStorage;
    }

    // Set encryption key for sensitive data
    setEncryptionKey(key) {
        this.encryptionKey = key;
    }

    // Get full key with prefix
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    // Set item in storage
    set(key, value, encrypt = false) {
        try {
            let data = value;
            
            if (typeof value === 'object') {
                data = JSON.stringify(value);
            }

            if (encrypt && this.encryptionKey) {
                data = this.encrypt(data);
            }

            this.storage.setItem(this.getKey(key), data);
            return true;
        } catch (error) {
            console.error(`Failed to set ${key}:`, error);
            return false;
        }
    }

    // Get item from storage
    get(key, decrypt = false) {
        try {
            let data = this.storage.getItem(this.getKey(key));
            
            if (data === null) {
                return null;
            }

            if (decrypt && this.encryptionKey) {
                data = this.decrypt(data);
            }

            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        } catch (error) {
            console.error(`Failed to get ${key}:`, error);
            return null;
        }
    }

    // Remove item from storage
    remove(key) {
        try {
            this.storage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            return false;
        }
    }

    // Clear all items with prefix
    clear() {
        try {
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    // Get all keys with prefix
    getAllKeys() {
        try {
            const keys = Object.keys(this.storage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.substring(this.prefix.length));
        } catch (error) {
            console.error('Failed to get all keys:', error);
            return [];
        }
    }

    // Get all items
    getAll() {
        try {
            const items = {};
            const keys = this.getAllKeys();
            keys.forEach(key => {
                items[key] = this.get(key);
            });
            return items;
        } catch (error) {
            console.error('Failed to get all items:', error);
            return {};
        }
    }

    // Check if key exists
    has(key) {
        return this.storage.getItem(this.getKey(key)) !== null;
    }

    // Get storage size
    getSize() {
        try {
            let size = 0;
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    size += this.storage.getItem(key).length * 2; // UTF-16
                }
            });
            return size;
        } catch (error) {
            console.error('Failed to get storage size:', error);
            return 0;
        }
    }

    // Check if storage is full
    isFull() {
        try {
            const testKey = 'test';
            this.storage.setItem(testKey, 'test');
            this.storage.removeItem(testKey);
            return false;
        } catch (error) {
            return true;
        }
    }

    // Encrypt data (simple encryption for demo)
    encrypt(data) {
        if (!this.encryptionKey) return data;
        
        try {
            // Simple XOR encryption (for demo purposes)
            const key = this.encryptionKey;
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(
                    data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return btoa(result);
        } catch (error) {
            console.error('Encryption failed:', error);
            return data;
        }
    }

    // Decrypt data
    decrypt(encryptedData) {
        if (!this.encryptionKey) return encryptedData;
        
        try {
            const data = atob(encryptedData);
            const key = this.encryptionKey;
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(
                    data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return result;
        } catch (error) {
            console.error('Decryption failed:', error);
            return encryptedData;
        }
    }

    // Session storage methods
    session = {
        set: (key, value) => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`Failed to set session ${key}:`, error);
                return false;
            }
        },
        get: (key) => {
            try {
                const data = sessionStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error(`Failed to get session ${key}:`, error);
                return null;
            }
        },
        remove: (key) => {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error(`Failed to remove session ${key}:`, error);
                return false;
            }
        },
        clear: () => {
            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('Failed to clear session:', error);
                return false;
            }
        }
    };

    // Cookie methods (fallback for older browsers)
    cookie = {
        set: (name, value, days = 7) => {
            try {
                const expires = new Date();
                expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
                document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
                return true;
            } catch (error) {
                console.error(`Failed to set cookie ${name}:`, error);
                return false;
            }
        },
        get: (name) => {
            try {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                    return parts.pop().split(';').shift();
                }
                return null;
            } catch (error) {
                console.error(`Failed to get cookie ${name}:`, error);
                return null;
            }
        },
        remove: (name) => {
            try {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                return true;
            } catch (error) {
                console.error(`Failed to remove cookie ${name}:`, error);
                return false;
            }
        }
    };
}

// Create singleton instance
const storage = new StorageService();

export default storage;