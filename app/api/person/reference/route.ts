import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import {
  listSexTranslations,
  listEmailLabelTranslations,
  listPhoneLabelTranslations,
  listAddressLabelTranslations,
  listMilitaryServiceStatusTranslations,
  listMilitaryServiceLocationTranslations,
  listInsuranceTypeTranslations,
  listRelationshipTypeTranslations,
  listMaritalStatusTranslations,
  listMaritalStatuses,
  listBirthCertificateSeriesLetterTranslations,
  listReligionTranslations,
  listContractTypeTranslations,
  listEmploymentActivityFieldTranslations,
  listEmploymentActivityUnitTranslations,
  listEmploymentPositionTranslations,
  listEmploymentActivityUnits,
  listEmploymentPositions,
  listDocumentTypeTranslations,
  listEducationLevelTranslations,
  listFieldOfStudyTranslations,
  listProfessionalTrainingTypeTranslations,
  listProfessionalTrainingCertificateIssuerTranslations,
} from '@/services/person-api';

// GET: Fetch all reference data translations in one call
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const token = session.accessToken;

    const results = await Promise.allSettled([
      listSexTranslations(token),
      listEmailLabelTranslations(token),
      listPhoneLabelTranslations(token),
      listAddressLabelTranslations(token),
      listMilitaryServiceStatusTranslations(token),
      listInsuranceTypeTranslations(token),
      listRelationshipTypeTranslations(token),
      listMaritalStatusTranslations(token),
      listMaritalStatuses(token),
      listBirthCertificateSeriesLetterTranslations(token),
      listReligionTranslations(token),
      listMilitaryServiceLocationTranslations(token),
      listContractTypeTranslations(token),
      listEmploymentActivityFieldTranslations(token),
      listEmploymentActivityUnitTranslations(token),
      listEmploymentPositionTranslations(token),
      listDocumentTypeTranslations(token),
      listEducationLevelTranslations(token),
      listFieldOfStudyTranslations(token),
      listProfessionalTrainingTypeTranslations(token),
      listProfessionalTrainingCertificateIssuerTranslations(token),
      listEmploymentActivityUnits(token),
      listEmploymentPositions(token),
    ]);

    const getValue = (r: PromiseSettledResult<unknown>) =>
      r.status === 'fulfilled' ? r.value : [];

    return NextResponse.json({
      sexTranslations: getValue(results[0]),
      emailLabelTranslations: getValue(results[1]),
      phoneLabelTranslations: getValue(results[2]),
      addressLabelTranslations: getValue(results[3]),
      militaryServiceStatusTranslations: getValue(results[4]),
      insuranceTypeTranslations: getValue(results[5]),
      relationshipTypeTranslations: getValue(results[6]),
      maritalStatusTranslations: getValue(results[7]),
      maritalStatuses: getValue(results[8]),
      birthCertificateSeriesLetterTranslations: getValue(results[9]),
      religionTranslations: getValue(results[10]),
      militaryServiceLocationTranslations: getValue(results[11]),
      contractTypeTranslations: getValue(results[12]),
      employmentActivityFieldTranslations: getValue(results[13]),
      employmentActivityUnitTranslations: getValue(results[14]),
      employmentPositionTranslations: getValue(results[15]),
      documentTypeTranslations: getValue(results[16]),
      educationLevelTranslations: getValue(results[17]),
      fieldOfStudyTranslations: getValue(results[18]),
      professionalTrainingTypeTranslations: getValue(results[19]),
      professionalTrainingCertificateIssuerTranslations: getValue(results[20]),
      employmentActivityUnits: getValue(results[21]),
      employmentPositions: getValue(results[22]),
    });
  } catch (error) {
    console.error('Error fetching reference data:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 },
    );
  }
}
