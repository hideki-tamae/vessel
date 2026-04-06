import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// 修正後（本来の姿）

export async function POST(request: Request) {
  const { userId } = await request.json();

  const calibration = await prisma.peakCalibration.update({
    where: { userId },
    data: {
      isTrapped: false,
      proposedSync: false,
      syncedAt: new Date(),
    }
  });

  return NextResponse.json({ success: true, calibration });
}
