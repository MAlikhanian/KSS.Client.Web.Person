import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { addAddress, updateAddress, removeAddress, addAddressTranslation, updateAddressTranslation, listSubByPerson } from '@/services/person-api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }
    const personId = request.nextUrl.searchParams.get('personId');
    if (!personId) {
      return NextResponse.json({ message: 'personId is required' }, { status: 400 });
    }
    const data = await listSubByPerson(session.accessToken, 'Address', personId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();

    // If body has translations, handle address + translations
    const { translations, ...addressData } = body;
    const result = await addAddress(session.accessToken, addressData);

    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        await addAddressTranslation(session.accessToken, {
          ...translation,
          addressId: result.id,
        });
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();
    const { translations, ...addressData } = body;

    await updateAddress(session.accessToken, addressData);

    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        const translationWithId = { ...translation, addressId: addressData.id };
        try {
          await updateAddressTranslation(session.accessToken, translationWithId);
        } catch {
          try {
            await addAddressTranslation(session.accessToken, translationWithId);
          } catch {
            // Already exists and update failed — ignore
          }
        }
      }
    }

    return NextResponse.json({ message: 'Address updated successfully.' });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();
    await removeAddress(session.accessToken, body);
    return NextResponse.json({ message: 'Address deleted successfully.' });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
