import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { addProfessionalTrainingDocument, removeProfessionalTrainingDocument } from '@/services/person-api';
import { getAvailableInstance, uploadFile, deleteFile } from '@/services/file-orchestrator-api';

// POST: Upload a professional training document (through orchestrator)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const professionalTrainingId = formData.get('professionalTrainingId') as string;
    const professionalTrainingDocumentTypeId = Number(formData.get('professionalTrainingDocumentTypeId'));
    const file = formData.get('file') as File | null;

    if (!professionalTrainingId || !professionalTrainingDocumentTypeId || !file) {
      return NextResponse.json({ message: 'professionalTrainingId, professionalTrainingDocumentTypeId, and file are required' }, { status: 400 });
    }

    // Step 1: Get available instance from orchestrator
    const instance = await getAvailableInstance(session.accessToken, 'PersonPTDocument');

    // Step 2: Create metadata in Person API
    const docResult = await addProfessionalTrainingDocument(session.accessToken, {
      id: '00000000-0000-0000-0000-000000000000',
      professionalTrainingId,
      professionalTrainingDocumentTypeId,
      storageInstanceId: instance.id,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
    });

    // Step 3: Upload file bytes through orchestrator
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await uploadFile(session.accessToken, docResult.id, 'PersonPTDocument', buffer);

    return NextResponse.json(docResult);
  } catch (error) {
    console.error('Error uploading professional training document:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}

// DELETE: Delete a professional training document (metadata + blob through orchestrator)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, storageInstanceId } = body;

    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }

    // Delete blob through orchestrator
    if (storageInstanceId) {
      await deleteFile(session.accessToken, id, storageInstanceId);
    }

    // Delete metadata from Person API
    await removeProfessionalTrainingDocument(session.accessToken, { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting professional training document:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
