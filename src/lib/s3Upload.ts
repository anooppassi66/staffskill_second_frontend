import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
  requestChecksumCalculation: "when_supported", // ✅ lowercase
  responseChecksumValidation: "when_supported", // ✅ lowercase
});

export interface UploadResult {
  success: boolean;
  key?: string;
  error?: string;
}

export const uploadToS3 = async (
  file: File,
  bucketName: string = process.env.NEXT_PUBLIC_S3_BUCKET || 'your-bucket-name',
  key?: string,
  contentType?: string
): Promise<UploadResult> => {
  try {
    const fileKey = key || `uploads/${Date.now()}-${file.name}`;

    const upload = new Upload({
      client: s3Client,
      queueSize: 1,
      leavePartsOnError: false,
      params: {
        Bucket: bucketName,
        Key: fileKey,
        Body: file,
        ContentType: contentType || file.type,
        ChecksumAlgorithm: "CRC32", // ✅ must match client-level checksum config
      },
    });

    const result = await upload.done();

    return result
      ? { success: true, key: fileKey }
      : { success: false, error: 'Upload completed but no result returned' };

  } catch (error: any) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

export const uploadMultipleToS3 = async (
  files: File[],
  bucketName?: string,
  baseKey: string = 'uploads'
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (const file of files) {
    const key = `${baseKey}/${Date.now()}-${file.name}`;
    const result = await uploadToS3(file, bucketName, key);
    results.push(result);
  }

  return results;
};

export const getS3Url = (
  key: string,
  bucketName: string = process.env.NEXT_PUBLIC_S3_BUCKET || 'your-bucket-name'
): string => {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};