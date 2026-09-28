import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getPersonNamesByIds } from '@/services/person-api';

/**
 * POST /api/person/names  { ids: string[], languageId?: number }
 *
 * Forwards to KSS.Service.Person `POST /Api/Person/Names`, which resolves
 * display names (firstName/lastName/nationalId) for a SPECIFIC set of person
 * ids — used to label rows by person (e.g. the import "Uploaded By" column)
 * without loading the whole directory.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const languageId: number = Number(body?.languageId) || 12;

    if (ids.length === 0) return NextResponse.json([]);

    const names = await getPersonNamesByIds(session.accessToken, ids, languageId);
    return NextResponse.json(names);
  } catch (error) {
    console.error('Error resolving person names:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
