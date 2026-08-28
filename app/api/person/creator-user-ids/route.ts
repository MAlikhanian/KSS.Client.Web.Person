import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getPersonCreatorUserIds } from '@/services/person-api';

// GET /api/person/creator-user-ids — proxies the distinct Person.CreatedBy
// list from KSS.Service.Person. Powers the dashboard Highlights tile.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userIds = await getPersonCreatorUserIds(session.accessToken);
    return NextResponse.json({ userIds });
  } catch (error) {
    console.error('Error fetching creator user ids:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
