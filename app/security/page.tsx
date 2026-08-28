'use client';

import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { PersonSecurityContent } from './content';
import { PageNavbar } from '@/app/page-navbar';

export default function PersonSecurityPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <PersonSecurityContent />
      </Container>
    </Fragment>
  );
}
