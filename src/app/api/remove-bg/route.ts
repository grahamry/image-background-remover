import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. 获取图片数据
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 },
      );
    }

    // 3. 验证文件大小（Vercel 免费版限制 4.5MB）
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4MB.' },
        { status: 400 },
      );
    }

    // 4. 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG and JPEG are allowed.' },
        { status: 400 },
      );
    }

    // 5. 调用 Remove.bg API
    const removeBgApiKey = process.env.REMOVE_BG_API_KEY;

    if (!removeBgApiKey) {
      return NextResponse.json(
        { error: 'Remove.bg API key not configured' },
        { status: 500 },
      );
    }

    const imageArrayBuffer = await file.arrayBuffer();
    const imageBase64 = arrayBufferToBase64(imageArrayBuffer);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': removeBgApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: imageBase64,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Remove.bg API error: ${errorText}` },
        { status: response.status },
      );
    }

    // 6. 返回处理后的图片
    const resultBuffer = await response.arrayBuffer();

    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // 缓存 24 小时
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
