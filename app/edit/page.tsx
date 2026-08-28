'use client';

import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { PersonContent } from './content';
import { PageNavbar } from '@/app/page-navbar';

export default function PersonPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <PersonContent />
      </Container>
    </Fragment>
  );
}
