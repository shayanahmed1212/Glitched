import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { DEMO_USER_ID } from '@/lib/types';

// R2 is S3-compatible — point the AWS SDK at the R2 endpoint.
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  // TODO(auth): gate this again once Supabase auth is wired back in.
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    return NextResponse.json({ error: 'Storage is not configured yet' }, { status: 503 });
  }

  const { contentType } = await req.json();
  if (!contentType?.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
  }

  const key = `posts/${DEMO_USER_ID}/${randomUUID()}.webp`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  // 5 minute window to complete the upload from the browser.
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
