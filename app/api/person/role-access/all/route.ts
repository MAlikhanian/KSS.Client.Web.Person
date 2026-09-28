import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { listAllRoleAccessGrants } from '@/services/person-api';

// GET /api/person/role-access/all — every role grant in the system.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await listAllRoleAccessGrants(session.accessToken);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error listing all role access grants:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
