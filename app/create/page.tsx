'use client';

import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { PageNavbar } from '@/app/page-navbar';
import { CreatePersonContent } from './content';

export default function CreatePersonPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <CreatePersonContent />
      </Container>
    </Fragment>
  );
}
