'use client';

import { Navbar } from '@/partials/navbar/navbar';
import { NavbarMenu } from '@/partials/navbar/navbar-menu';
import { useSettings } from '@/providers/settings-provider';
import { Container } from '@/components/common/container';
import { useTranslatedMenu } from '@/lib/use-translated-menu';

// Sub-nav for the Persons section. Lists the sidebar's `Persons` children
// (Person View, Edit Person, Person Security, Access Management), minus the
// `Person New` (/person/create) tab — that one is intentionally hidden from
// the section tab bar but kept in the global sidebar. `useTranslatedMenu`
// already applies filterMenuByRole to `menuSidebar`, so these children are
// permission-filtered the same way the global sidebar is — each tab still
// respects its own `permissions`.
const PageNavbar = () => {
  const { settings } = useSettings();
  const { menuSidebar } = useTranslatedMenu();

  const personMenuConfig = menuSidebar
    ?.find((m) => m.title === 'اشخاص' || m.title === 'Persons')
    ?.children?.filter((c) => c.path !== '/person/create');

  if (personMenuConfig && settings?.layout === 'demo1') {
    return (
      <Navbar>
        <Container>
          <NavbarMenu items={personMenuConfig} />
        </Container>
      </Navbar>
    );
  } else {
    return <></>;
  }
};

export { PageNavbar };
