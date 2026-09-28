import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { revokeRoleAccessByPair } from '@/services/person-api';

// DELETE /api/person/role-access/by-pair?grantedToRoleId=…&personId=… —
// revoke all rows for the (personId|null, grantedToRoleId) pair.
// personId omitted → revokes a global grant.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const grantedToRoleId = request.nextUrl.searchParams.get('grantedToRoleId');
    const personId = request.nextUrl.searchParams.get('personId');

    if (!grantedToRoleId) {
      return NextResponse.json(
        { message: 'grantedToRoleId is required' },
        { status: 400 },
      );
    }

    await revokeRoleAccessByPair(session.accessToken, grantedToRoleId, personId);
    return NextResponse.json({ message: 'Role access revoked.' });
  } catch (error) {
    console.error('Error revoking role access:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
