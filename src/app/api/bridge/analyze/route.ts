import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendBaseUrl = process.env.CIV_OS_BACKEND_URL || 'http://127.0.0.1:8000';
    const upstream = await fetch(`${backendBaseUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        omegaScore: body?.omegaScore,
        neuralState: body?.neuralState,
      }),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Bridge error' }, { status: 500 });
  }
}

