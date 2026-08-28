import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { listPersonDirectory } from '@/services/person-api';

/**
 * GET /api/person/directory
 *
 * Forwards to KSS.Service.Person `GET /Api/Person/Directory` which returns
 * ALL persons with minimal info only (id, nationalId, translation names).
 *
 * Unlike `/api/person`, this endpoint bypasses the per-caller access filter
 * — it is intentionally used by the access-grant dropdown so the user can
 * pick any person on the system. Profile details are still protected by
 * `/api/person/[id]` and `/api/person?query=...`.
 *
 * The response shape matches `/api/person` (`{ data, pagination, empty }`)
 * so PersonSearch can consume either endpoint interchangeably via its
 * `apiUrl` prop.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 100);
    const query = searchParams.get('query') || '';

    let persons = await listPersonDirectory(session.accessToken);

    if (query) {
      const q = query.toLowerCase();
      persons = persons.filter((p) => {
        if (p.nationalId?.toLowerCase().includes(q)) return true;
        return p.translations?.some(
          (tr) =>
            tr.firstName?.toLowerCase().includes(q) ||
            tr.lastName?.toLowerCase().includes(q),
        );
      });
    }

    const total = persons.length;
    const skip = (page - 1) * limit;
    const paginated = persons.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginated,
      pagination: { total, page },
      empty: total === 0,
    });
  } catch (error) {
    console.error('Error fetching person directory:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Something went wrong.',
      },
      { status: 500 },
    );
  }
}
