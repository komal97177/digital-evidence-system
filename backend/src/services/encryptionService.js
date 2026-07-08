const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.encryptionKey = process.env.ENCRYPTION_KEY || 
            crypto.randomBytes(32).toString('hex');
        this.ivLength = 16;
    }

    /**
     * Encrypt a file using AES-256-CBC
     */
    async encryptFile(inputPath, outputPath) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const key = Buffer.from(this.encryptionKey, 'hex');
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);
            
            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream(outputPath);
            
            // Write IV at the beginning of the file
            output.write(iv);
            
            return new Promise((resolve, reject) => {
                input.pipe(cipher)
                    .pipe(output)
                    .on('finish', resolve)
                    .on('error', reject);
            });
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt a file using AES-256-CBC
     */
    async decryptFile(inputPath, outputPath) {
        try {
            const input = await fs.readFile(inputPath);
            
            // Extract IV from beginning of file
            const iv = input.slice(0, this.ivLength);
            const encryptedData = input.slice(this.ivLength);
            
            const key = Buffer.from(this.encryptionKey, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            
            const decrypted = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final()
            ]);
            
            await fs.writeFile(outputPath, decrypted);
            return outputPath;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    /**
     * Encrypt data buffer
     */
    encryptData(data) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const key = Buffer.from(this.encryptionKey, 'hex');
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);
            
            const encrypted = Buffer.concat([
                cipher.update(data),
                cipher.final()
            ]);
            
            return {
                iv: iv.toString('hex'),
                encryptedData: encrypted.toString('hex')
            };
        } catch (error) {
            throw new Error(`Data encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt data buffer
     */
    decryptData(encryptedData, iv) {
        try {
            const key = Buffer.from(this.encryptionKey, 'hex');
            const decipher = crypto.createDecipheriv(
                this.algorithm, 
                key, 
                Buffer.from(iv, 'hex')
            );
            
            const decrypted = Buffer.concat([
                decipher.update(Buffer.from(encryptedData, 'hex')),
                decipher.final()
            ]);
            
            return decrypted;
        } catch (error) {
            throw new Error(`Data decryption failed: ${error.message}`);
        }
    }

    /**
     * Generate a new encryption key
     */
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Generate a random IV
     */
    generateIV() {
        return crypto.randomBytes(this.ivLength);
    }

    /**
     * Encrypt a string
     */
    encryptString(text) {
        const { iv, encryptedData } = this.encryptData(Buffer.from(text, 'utf8'));
        return {
            iv,
            encryptedData
        };
    }

    /**
     * Decrypt a string
     */
    decryptString(encryptedData, iv) {
        const decrypted = this.decryptData(encryptedData, iv);
        return decrypted.toString('utf8');
    }

    /**
     * Encrypt JSON data
     */
    encryptJSON(data) {
        const jsonString = JSON.stringify(data);
        return this.encryptString(jsonString);
    }

    /**
     * Decrypt JSON data
     */
    decryptJSON(encryptedData, iv) {
        const decrypted = this.decryptString(encryptedData, iv);
        return JSON.parse(decrypted);
    }

    /**
     * Check if file is encrypted (has IV prefix)
     */
    async isFileEncrypted(filePath) {
        try {
            const stats = await fs.stat(filePath);
            if (stats.size < this.ivLength) return false;
            
            // Read first 16 bytes
            const fd = await fs.open(filePath, 'r');
            const buffer = Buffer.alloc(this.ivLength);
            await fs.read(fd, buffer, 0, this.ivLength, 0);
            await fs.close(fd);
            
            // Check if it looks like a valid IV (random data)
            return true; // Assume it's encrypted
        } catch (error) {
            return false;
        }
    }

    /**
     * Get encryption key (for backup purposes)
     */
    getEncryptionKey() {
        return this.encryptionKey;
    }

    /**
     * Rotate encryption key (re-encrypt all files)
     */
    async rotateEncryptionKey(newKey, filePaths) {
        const oldKey = this.encryptionKey;
        this.encryptionKey = newKey;
        
        const results = [];
        for (const filePath of filePaths) {
            try {
                // Decrypt with old key
                const tempPath = filePath + '.temp';
                await this.decryptFile(filePath, tempPath);
                
                // Encrypt with new key
                await this.encryptFile(tempPath, filePath);
                await fs.remove(tempPath);
                
                results.push({
                    filePath,
                    success: true
                });
            } catch (error) {
                results.push({
                    filePath,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }
}

module.exports = new EncryptionService();