import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { listDocumentsByPerson, addDocument, updateDocument, removeDocument } from '@/services/person-api';
import { getAvailableInstance, uploadFile, deleteFile } from '@/services/file-orchestrator-api';

// GET: List documents for a person (from Person API)
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

    const documents = await listDocumentsByPerson(session.accessToken, personId);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// POST: Upload a new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const personId = formData.get('personId') as string;
    const documentTypeId = Number(formData.get('documentTypeId'));
    const file = formData.get('file') as File | null;

    if (!personId || !documentTypeId || !file) {
      return NextResponse.json({ message: 'personId, documentTypeId, and file are required' }, { status: 400 });
    }

    // Step 1: Get available instance from orchestrator
    const instance = await getAvailableInstance(session.accessToken, 'PersonDocument');

    // Step 2: Create document metadata in Person API
    const docResult = await addDocument(session.accessToken, {
      id: '00000000-0000-0000-0000-000000000000',
      personId,
      documentTypeId,
      storageInstanceId: instance.id,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
    });

    // Step 3: Upload file bytes through orchestrator
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await uploadFile(session.accessToken, docResult.id, 'PersonDocument', buffer);

    return NextResponse.json(docResult);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// PUT: Update document metadata (and optionally replace file)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const personId = formData.get('personId') as string;
    const documentTypeId = Number(formData.get('documentTypeId'));
    const file = formData.get('file') as File | null;

    if (!id || !personId) {
      return NextResponse.json({ message: 'id and personId are required' }, { status: 400 });
    }

    // Update metadata in Person API
    await updateDocument(session.accessToken, {
      id,
      documentTypeId,
      fileName: file ? file.name : '',
    });

    // If new file, replace blob through orchestrator
    if (file) {
      const docs = await listDocumentsByPerson(session.accessToken, personId);
      const doc = Array.isArray(docs) ? docs.find((d: { id: string }) => d.id.toLowerCase() === id.toLowerCase()) : null;
      if (doc) {
        await deleteFile(session.accessToken, id, doc.storageInstanceId);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await uploadFile(session.accessToken, id, 'PersonDocument', buffer);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// DELETE: Delete a document (metadata + blob)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, personId } = body;

    if (!id || !personId) {
      return NextResponse.json({ message: 'id and personId are required' }, { status: 400 });
    }

    // Get doc to find storageInstanceId
    const docs = await listDocumentsByPerson(session.accessToken, personId);
    const doc = Array.isArray(docs) ? docs.find((d: { id: string }) => d.id.toLowerCase() === id.toLowerCase()) : null;

    // Delete blob through orchestrator
    if (doc) {
      await deleteFile(session.accessToken, id, doc.storageInstanceId);
    }

    // Delete metadata from Person API
    await removeDocument(session.accessToken, { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
