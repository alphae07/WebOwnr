import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || defineSecret('CLOUDINARY_CLOUD_NAME'),
  api_key: process.env.CLOUDINARY_API_KEY || defineSecret('CLOUDINARY_API_KEY'),
  api_secret: process.env.CLOUDINARY_API_SECRET || defineSecret('CLOUDINARY_API_SECRET'),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'others';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Uploading file:', file.name, 'to folder:', folder);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: `webownr/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result?.public_id);
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });
    
    return NextResponse.json({ 
      url: result.secure_url,
      publicId: result.public_id 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' }, 
      { status: 500 }
    );
  }
}