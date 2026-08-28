import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { revokeAccessByPair } from '@/services/person-api';

// DELETE /api/person/access/by-pair/{personId}/{grantedToPersonId} —
// owner-only revoke of all rows for the (owner, grantee) pair.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ personId: string; grantedToPersonId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { personId, grantedToPersonId } = await params;
    if (!personId || !grantedToPersonId) {
      return NextResponse.json(
        { message: 'personId and grantedToPersonId are required' },
        { status: 400 },
      );
    }

    await revokeAccessByPair(session.accessToken, personId, grantedToPersonId);
    return NextResponse.json({ message: 'Access revoked.' });
  } catch (error) {
    console.error('Error revoking person access by pair:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
