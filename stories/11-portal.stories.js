// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import PortalApp from './src/portal/portal-app';
import { quotes } from './src/data';

storiesOf('Portals', module).add('Using your own portal', () => (
  <PortalApp initial={quotes.slice(0, 2)} />
));
