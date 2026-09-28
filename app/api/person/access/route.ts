import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import {
  listAccessGrantsByOwner,
  upsertAccessGrant,
} from '@/services/person-api';

// GET /api/person/access?personId=… — list grants given out by personId, with all 3 section levels.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const personId = request.nextUrl.searchParams.get('personId');
    if (!personId) {
      return NextResponse.json({ message: 'personId is required' }, { status: 400 });
    }

    const data = await listAccessGrantsByOwner(session.accessToken, personId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error listing person access grants:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// POST /api/person/access — upsert per-section grant. Body shape: AccessGrantDto.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await upsertAccessGrant(session.accessToken, body);
    return NextResponse.json({ message: 'Access grant saved.' }, { status: 200 });
  } catch (error) {
    console.error('Error granting person access:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
