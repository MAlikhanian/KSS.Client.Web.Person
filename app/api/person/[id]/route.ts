import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getPersonById, updatePerson, deletePerson } from '@/services/person-api';

// GET: Fetch a specific person by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const { id } = await params;
    const person = await getPersonById(session.accessToken, id);

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}

// PUT: Update a specific person by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    await updatePerson(session.accessToken, { ...body, id });

    return NextResponse.json({ message: 'Person updated successfully.' });
  } catch (error) {
    console.error('Error updating person:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a specific person by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Get the person first to pass the full entity to Remove
    const person = await getPersonById(session.accessToken, id);
    await deletePerson(session.accessToken, person);

    return NextResponse.json({ message: 'Person deleted successfully.' });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
