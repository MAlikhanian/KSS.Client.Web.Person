import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getCurrentPerson } from '@/services/person-api';

// GET: Fetch the caller's own minimal person info (Id, NationalId, translations).
// Proxies to /Api/Person/Me — bypasses Person.Information.Read so users with
// no roles can still render their own name in the topbar.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const person = await getCurrentPerson(session.accessToken);
    return NextResponse.json(person);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
