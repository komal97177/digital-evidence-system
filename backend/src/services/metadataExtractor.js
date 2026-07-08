const exifr = require('exifr');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

class MetadataExtractor {
    /**
     * Extract metadata from file
     */
    async extractMetadata(filePath) {
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        const metadata = {
            basic: await this.getBasicMetadata(filePath),
            mimeType,
            type: mimeType.split('/')[0],
            ...await this.extractByType(filePath, mimeType)
        };
        
        return metadata;
    }

    /**
     * Get basic file metadata
     */
    async getBasicMetadata(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                fileName: path.basename(filePath),
                fileSize: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime,
                extension: path.extname(filePath),
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Extract metadata based on file type
     */
    async extractByType(filePath, mimeType) {
        const type = mimeType.split('/')[0];
        
        switch (type) {
            case 'image':
                return await this.extractImageMetadata(filePath);
            case 'video':
                return await this.extractVideoMetadata(filePath);
            case 'audio':
                return await this.extractAudioMetadata(filePath);
            case 'application':
                return await this.extractDocumentMetadata(filePath, mimeType);
            case 'text':
                return await this.extractTextMetadata(filePath);
            default:
                return {};
        }
    }

    /**
     * Extract image metadata
     */
    async extractImageMetadata(filePath) {
        try {
            // Get EXIF data
            const exifData = await exifr.parse(filePath);
            
            // Get image dimensions using sharp
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            // Get dominant color
            const dominantColor = await this.getDominantColor(filePath);
            
            return {
                image: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                    hasAlpha: metadata.hasAlpha,
                    space: metadata.space,
                    channels: metadata.channels,
                    depth: metadata.depth,
                    dominantColor
                },
                exif: exifData || null
            };
        } catch (error) {
            return { 
                image: { error: error.message },
                exif: null
            };
        }
    }

    /**
     * Get dominant color of image
     */
    async getDominantColor(filePath) {
        try {
            const image = sharp(filePath);
            const { dominant } = await image.stats();
            return dominant;
        } catch (error) {
            return null;
        }
    }

    /**
     * Extract video metadata
     */
    async extractVideoMetadata(filePath) {
        try {
            // Basic video metadata
            const stats = await fs.stat(filePath);
            return {
                video: {
                    duration: null, // Would need ffprobe
                    codec: null,
                    resolution: null,
                    bitrate: null,
                    fps: null
                },
                fileInfo: {
                    size: stats.size,
                    created: stats.birthtime
                }
            };
        } catch (error) {
            return { video: { error: error.message } };
        }
    }

    /**
     * Extract audio metadata
     */
    async extractAudioMetadata(filePath) {
        try {
            return {
                audio: {
                    duration: null,
                    bitrate: null,
                    sampleRate: null,
                    channels: null
                }
            };
        } catch (error) {
            return { audio: { error: error.message } };
        }
    }

    /**
     * Extract document metadata
     */
    async extractDocumentMetadata(filePath, mimeType) {
        try {
            const stats = await fs.stat(filePath);
            const documentInfo = {
                pageCount: null,
                wordCount: null,
                author: null,
                title: null,
                subject: null,
                keywords: null
            };

            // Handle different document types
            if (mimeType === 'application/pdf') {
                // PDF specific extraction
                documentInfo.type = 'PDF';
            } else if (mimeType.includes('word')) {
                documentInfo.type = 'Word Document';
            } else if (mimeType.includes('excel')) {
                documentInfo.type = 'Excel Spreadsheet';
            } else if (mimeType.includes('powerpoint')) {
                documentInfo.type = 'PowerPoint Presentation';
            }

            return {
                document: {
                    ...documentInfo,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                }
            };
        } catch (error) {
            return { document: { error: error.message } };
        }
    }

    /**
     * Extract text file metadata
     */
    async extractTextMetadata(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const stats = await fs.stat(filePath);
            
            return {
                text: {
                    lineCount: content.split('\n').length,
                    wordCount: content.split(/\s+/).length,
                    characterCount: content.length,
                    size: stats.size,
                    encoding: 'utf8'
                }
            };
        } catch (error) {
            return { text: { error: error.message } };
        }
    }

    /**
     * Extract EXIF data specifically
     */
    async extractEXIF(filePath) {
        try {
            return await exifr.parse(filePath);
        } catch (error) {
            return null;
        }
    }

    /**
     * Extract GPS data from image
     */
    async extractGPSData(filePath) {
        try {
            const exifData = await exifr.parse(filePath);
            if (exifData && exifData.gps) {
                return {
                    latitude: exifData.gps.latitude,
                    longitude: exifData.gps.longitude,
                    altitude: exifData.gps.altitude,
                    timestamp: exifData.gps.DateTimeOriginal
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get file hash and metadata combined
     */
    async getFileAnalysis(filePath, hashService) {
        const metadata = await this.extractMetadata(filePath);
        const hash = await hashService.calculateFileSHA256(filePath);
        
        return {
            hash,
            metadata
        };
    }

    /**
     * Batch extract metadata from multiple files
     */
    async batchExtractMetadata(filePaths) {
        const results = {};
        for (const filePath of filePaths) {
            try {
                results[filePath] = await this.extractMetadata(filePath);
            } catch (error) {
                results[filePath] = { error: error.message };
            }
        }
        return results;
    }
}

module.exports = new MetadataExtractor();