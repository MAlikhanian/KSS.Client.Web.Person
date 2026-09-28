'use client';

import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { PersonAccessContent } from './content';
import { PageNavbar } from '@/app/page-navbar';

export default function PersonAccessPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <PersonAccessContent />
      </Container>
    </Fragment>
  );
}
