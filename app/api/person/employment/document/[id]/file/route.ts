import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { listSubByPerson } from '@/services/person-api';
import { downloadFile } from '@/services/file-orchestrator-api';

// GET: Download an employment document file by document ID (through orchestrator)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const personId = request.nextUrl.searchParams.get('personId');

    if (!personId) {
      return NextResponse.json({ message: 'personId query param is required' }, { status: 400 });
    }

    // Get employment rows for the person, then flatten their nested documents
    const rows = await listSubByPerson(session.accessToken, 'Employment', personId);
    const docs = Array.isArray(rows)
      ? rows.flatMap((r: { employmentDocuments?: Array<{ id: string; storageInstanceId: number; fileName: string; contentType: string }> }) => r.employmentDocuments || [])
      : [];
    const doc = docs.find((d: { id: string }) => d.id.toLowerCase() === id.toLowerCase());

    if (!doc || !doc.storageInstanceId) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Download file bytes through orchestrator
    const fileDataBase64 = await downloadFile(session.accessToken, id, doc.storageInstanceId);

    if (!fileDataBase64) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    const buffer = Buffer.from(fileDataBase64, 'base64');

    // Content-Disposition: inline for browser-viewable types, attachment for others.
    // SVG is intentionally NOT viewable-inline — an uploaded SVG can carry inline
    // <script> and would execute as same-origin stored XSS; force it to download.
    const viewableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const disposition = viewableTypes.includes(doc.contentType)
      ? `inline; filename="${encodeURIComponent(doc.fileName)}"`
      : `attachment; filename="${encodeURIComponent(doc.fileName)}"`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': doc.contentType || 'application/octet-stream',
        'Content-Disposition': disposition,
        'Content-Length': String(buffer.length),
        // Defense-in-depth for user-uploaded content served on the app origin:
        // block MIME-sniffing and neutralize any script execution if rendered.
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': 'sandbox',
      },
    });
  } catch (error) {
    console.error('Error downloading employment document file:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
