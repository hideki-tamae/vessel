import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Using environment variable or default local Fast API server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // Determine the action to route properly
    const action = body.action || 'analyze';
    let endpoint = '/analyze';
    if (action === 'evaluate_care') endpoint = '/api/v1/care/evaluate';
    if (action === 'request_session') endpoint = '/api/v1/marketplace/request';

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend returned an error:', errorText);
        return NextResponse.json({ error: 'Backend error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Bridge Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message || 'Unknown error' }, { status: 500 });
  }
}
