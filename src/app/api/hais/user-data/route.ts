import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 本人によるデータの確認・削除エンドポイント。
// GDPR/APPIの「認証」を主張するものではなく、その考え方（本人が自分のデータを見て・消せること）を
// 技術的に支える最小限の実装。法的な適合性の最終判断は法務レビューに委ねる。

// GET: 本人のデータをすべて確認する（データポータビリティの最小実装）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ success: false, error: 'walletAddress is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress },
    include: {
      scans: true,
      peakCalib: true,
      careActions: true,
      claims: true,
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
}

// DELETE: 本人のデータをすべて削除する。
// 関連レコード（ScanHistory / PeakCalibration / CareAction / Claim）を先に削除してから
// User本体を削除する。PrismaのスキーマにonDelete cascadeが未設定のため、明示的な順序で行う。
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ success: false, error: 'walletAddress is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { walletAddress } });
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.scanHistory.deleteMany({ where: { userId: user.id } }),
      prisma.careAction.deleteMany({ where: { userId: user.id } }),
      prisma.claim.deleteMany({ where: { userId: user.id } }),
      prisma.peakCalibration.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return NextResponse.json({ success: true, message: '本人データを削除しました。' });
  } catch (error: any) {
    console.error('User data deletion failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
