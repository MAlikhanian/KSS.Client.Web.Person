import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getPersonsList, createPersonWithTranslation } from '@/services/person-api';

// GET: Fetch all persons
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
    const limit = Number(searchParams.get('limit') || 10);
    const query = searchParams.get('query') || '';

    const result = await getPersonsList(session.accessToken);
    let persons = result.value;

    // Client-side search filtering (search across all translations)
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
    const paginatedPersons = persons.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginatedPersons,
      pagination: {
        total,
        page,
      },
      empty: total === 0,
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// POST: Create a new person with translation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = await createPersonWithTranslation(session.accessToken, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
