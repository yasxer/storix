'use server'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
})

export async function getUploadUrl(fileName: string, contentType: string, bucketName: string = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'article-photos') {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })
    
    // Construct the public URL
    const publicDomain = process.env.CLOUDFLARE_PUBLIC_URL
    const publicUrl = publicDomain ? `${publicDomain}/${fileName}` : `https://${bucketName}.r2.dev/${fileName}`

    return { success: true, uploadUrl: signedUrl, publicUrl }
  } catch (error: any) {
    console.error('Error generating signed URL:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteFileFromR2(fileName: string, bucketName: string = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'article-photos') {
  try {
    // If the fileName is a full URL, extract just the key
    let key = fileName;
    const publicDomain = process.env.CLOUDFLARE_PUBLIC_URL;
    if (publicDomain && fileName.startsWith(publicDomain)) {
       key = fileName.replace(`${publicDomain}/`, '');
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await R2.send(command)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return { success: false, error: error.message }
  }
}
