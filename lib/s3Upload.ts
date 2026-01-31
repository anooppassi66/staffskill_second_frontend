import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"

type UploadResult = {
  success: boolean
  key?: string
  error?: string
}

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function uploadToS3(
  file: File,
  bucketName: string = process.env.NEXT_PUBLIC_S3_BUCKET || "",
  key?: string,
  contentType?: string,
): Promise<UploadResult> {
  try {
    const fileKey = key || `uploads/${Date.now()}-${file.name}`
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileKey,
        Body: file,
        ContentType: contentType || file.type,
        ACL: "public-read",
      },
    })
    const r = await upload.done()
    if (r) {
      return { success: true, key: fileKey }
    }
    return { success: false, error: "Upload failed" }
  } catch (e: any) {
    return { success: false, error: e?.message || "Upload error" }
  }
}

export function getS3Url(
  key: string,
  bucketName: string = process.env.NEXT_PUBLIC_S3_BUCKET || "",
  region: string = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
): string {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
}
