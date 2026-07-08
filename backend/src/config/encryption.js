const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.encryptionKey = process.env.ENCRYPTION_KEY || 
            crypto.randomBytes(32).toString('hex');
    }

    calculateSHA256(data) {
        if (Buffer.isBuffer(data) || typeof data === 'string') {
            return crypto.createHash('sha256')
                .update(data)
                .digest('hex');
        }
        throw new Error('Input must be string or buffer');
    }

    async calculateFileSHA256(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    async encryptFile(inputPath, outputPath) {
        const iv = crypto.randomBytes(16);
        const key = Buffer.from(this.encryptionKey, 'hex');
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        
        output.write(iv);
        
        return new Promise((resolve, reject) => {
            input.pipe(cipher)
                .pipe(output)
                .on('finish', resolve)
                .on('error', reject);
        });
    }

    async decryptFile(inputPath, outputPath) {
        const input = await fs.readFile(inputPath);
        const iv = input.slice(0, 16);
        const encryptedData = input.slice(16);
        
        const key = Buffer.from(this.encryptionKey, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        
        const decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);
        
        await fs.writeFile(outputPath, decrypted);
        return outputPath;
    }

    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    async verifyIntegrity(filePath, expectedHash) {
        const actualHash = await this.calculateFileSHA256(filePath);
        return {
            verified: actualHash === expectedHash,
            actualHash,
            expectedHash
        };
    }
}

module.exports = new EncryptionService();