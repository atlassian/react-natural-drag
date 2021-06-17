// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import WithFixedSidebar from './src/fixed-list/fixed-sidebar';

storiesOf('fixed list', module).add('with fixed sidebar', () => (
  <WithFixedSidebar />
));
