import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import {
  listPersonAssetsByPerson,
  addPersonAsset,
  updatePersonAsset,
  removePersonAsset,
} from '@/services/portfolio-api';

// GET: List PersonAsset records by personId
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const personId = request.nextUrl.searchParams.get('personId');
    if (!personId) {
      return NextResponse.json({ message: 'personId is required' }, { status: 400 });
    }

    const data = await listPersonAssetsByPerson(session.accessToken, personId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error listing person assets:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// POST: Add a PersonAsset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await addPersonAsset(session.accessToken, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding person asset:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// PUT: Update a PersonAsset
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await updatePersonAsset(session.accessToken, body);
    return NextResponse.json({ message: 'PersonAsset updated successfully.' });
  } catch (error) {
    console.error('Error updating person asset:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a PersonAsset
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await removePersonAsset(session.accessToken, body);
    return NextResponse.json({ message: 'PersonAsset deleted successfully.' });
  } catch (error) {
    console.error('Error removing person asset:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
