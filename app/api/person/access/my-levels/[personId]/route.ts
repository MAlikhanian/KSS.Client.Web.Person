import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getMyAccessLevels } from '@/services/person-api';

// GET /api/person/access/my-levels/{personId} —
// returns { information, assets, access }, each 0=None / 1=View / 2=Edit.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ personId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { personId } = await params;
    if (!personId) {
      return NextResponse.json({ message: 'personId is required' }, { status: 400 });
    }

    const levels = await getMyAccessLevels(session.accessToken, personId);
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching access levels:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
