// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import MultipleContexts from './src/programmatic/multiple-contexts';

storiesOf('Multiple contexts', module).add('with multiple contexts', () => (
  <MultipleContexts />
));
