import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { upsertRoleAccessGrant } from '@/services/person-api';

// POST /api/person/role-access — upsert per-section role grant.
// Body: UpsertRoleAccessGrantBody (personId may be null for a global grant).
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await upsertRoleAccessGrant(session.accessToken, body);
    return NextResponse.json({ message: 'Role access grant saved.' }, { status: 200 });
  } catch (error) {
    console.error('Error granting role access:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
