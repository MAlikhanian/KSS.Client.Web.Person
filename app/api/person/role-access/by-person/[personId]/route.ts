import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { listRoleAccessGrantsByPerson } from '@/services/person-api';

// GET /api/person/role-access/by-person/{personId} —
// per-person + global role grants for this person's access page.
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

    const data = await listRoleAccessGrantsByPerson(session.accessToken, personId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error listing role access grants:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
