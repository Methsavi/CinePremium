import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_S3_CLIENTS,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KET_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadFileToR2 = async (fileBuffer, mimetype, originalName, folder = 'movies') => {
  const ext = originalName.split('.').pop();
  const fileName = `${folder}/${crypto.randomUUID()}-${Date.now()}.${ext}`;
  
  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Could not upload file');
  }
};
