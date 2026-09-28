import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { addPersonTranslation, updatePersonTranslation, upsertPersonTranslations } from '@/services/person-api';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();
    const result = await addPersonTranslation(session.accessToken, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// PUT: Upsert translations (like company pattern — sends personId + translations array)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();

    if (body.translations && Array.isArray(body.translations)) {
      // New pattern: upsert multiple translations at once
      await upsertPersonTranslations(session.accessToken, body);
    } else {
      // Legacy: single translation update
      await updatePersonTranslation(session.accessToken, body);
    }

    return NextResponse.json({ message: 'Translation(s) updated successfully.' });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
