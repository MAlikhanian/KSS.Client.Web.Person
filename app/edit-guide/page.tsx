'use client';

import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { PageNavbar } from '@/app/page-navbar';
import { PersonEditGuideContent } from './content';

export default function PersonEditGuidePage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <PersonEditGuideContent />
      </Container>
    </Fragment>
  );
}
