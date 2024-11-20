import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export interface IFileStorageService {
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}

class S3StorageService implements IFileStorageService {
    private s3Client: S3Client;
    private bucket: string;

    constructor() {
        this.bucket = process.env.AWS_S3_BUCKET || '';
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const key = `assignments/${uuidv4()}-${file.originalname}`;
        
        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            }));

            const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
            logger.info(`File uploaded successfully to S3: ${fileUrl}`);
            return fileUrl;
        } catch (error) {
            logger.error('Error uploading file to S3:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            const key = fileUrl.split('.com/')[1];
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key
            }));
            logger.info(`File deleted successfully from S3: ${fileUrl}`);
        } catch (error) {
            logger.error('Error deleting file from S3:', error);
            throw new Error('Failed to delete file from S3');
        }
    }
}

class LocalStorageService implements IFileStorageService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'assignments');
        this.ensureUploadDir();
    }

    private async ensureUploadDir(): Promise<void> {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, fileName);
        
        try {
            await fs.writeFile(filePath, file.buffer);
            const fileUrl = `/uploads/assignments/${fileName}`;
            logger.info(`File uploaded successfully to local storage: ${fileUrl}`);
            return fileUrl;
        } catch (error) {
            logger.error('Error uploading file to local storage:', error);
            throw new Error('Failed to upload file to local storage');
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            const fileName = fileUrl.split('/').pop();
            if (!fileName) throw new Error('Invalid file URL');
            
            const filePath = path.join(this.uploadDir, fileName);
            await fs.unlink(filePath);
            logger.info(`File deleted successfully from local storage: ${fileUrl}`);
        } catch (error) {
            logger.error('Error deleting file from local storage:', error);
            throw new Error('Failed to delete file from local storage');
        }
    }
}

// Factory function to get the appropriate storage service based on environment
function getFileStorageService(): IFileStorageService {
    const storageType = process.env.STORAGE_TYPE || 'local';
    
    switch (storageType.toLowerCase()) {
        case 's3':
            return new S3StorageService();
        case 'local':
            return new LocalStorageService();
        default:
            logger.warn(`Unknown storage type: ${storageType}, falling back to local storage`);
            return new LocalStorageService();
    }
}

export default getFileStorageService();
