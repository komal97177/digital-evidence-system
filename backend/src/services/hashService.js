const crypto = require('crypto');
const fs = require('fs-extra');

class HashService {
    /**
     * Calculate SHA-256 hash of a string or buffer
     */
    calculateSHA256(data) {
        if (Buffer.isBuffer(data) || typeof data === 'string') {
            return crypto.createHash('sha256')
                .update(data)
                .digest('hex');
        }
        throw new Error('Input must be string or buffer');
    }

    /**
     * Calculate SHA-256 hash of a file
     */
    async calculateFileSHA256(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    /**
     * Calculate SHA-256 hash of a buffer
     */
    calculateBufferSHA256(buffer) {
        return crypto.createHash('sha256')
            .update(buffer)
            .digest('hex');
    }

    /**
     * Calculate SHA-256 hash of a stream
     */
    calculateStreamSHA256(stream) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    /**
     * Generate a random hash (for temporary IDs)
     */
    generateRandomHash(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Generate a short hash
     */
    generateShortHash() {
        return crypto.randomBytes(8).toString('hex');
    }

    /**
     * Compare two hashes securely (timing attack safe)
     */
    compareHashes(hash1, hash2) {
        if (!hash1 || !hash2) return false;
        return crypto.timingSafeEqual(
            Buffer.from(hash1, 'hex'),
            Buffer.from(hash2, 'hex')
        );
    }

    /**
     * Verify file integrity
     */
    async verifyFileIntegrity(filePath, expectedHash) {
        try {
            const actualHash = await this.calculateFileSHA256(filePath);
            return {
                verified: actualHash === expectedHash,
                actualHash,
                expectedHash
            };
        } catch (error) {
            return {
                verified: false,
                error: error.message
            };
        }
    }

    /**
     * Get file hash with metadata
     */
    async getFileHashWithMetadata(filePath) {
        const hash = await this.calculateFileSHA256(filePath);
        const stats = await fs.stat(filePath);
        
        return {
            hash,
            fileSize: stats.size,
            modifiedTime: stats.mtime,
            createdTime: stats.birthtime
        };
    }

    /**
     * Generate HMAC for message authentication
     */
    generateHMAC(data, secret) {
        return crypto.createHmac('sha256', secret)
            .update(data)
            .digest('hex');
    }

    /**
     * Verify HMAC
     */
    verifyHMAC(data, secret, expectedHmac) {
        const actualHmac = this.generateHMAC(data, secret);
        return this.compareHashes(actualHmac, expectedHmac);
    }
}

module.exports = new HashService();