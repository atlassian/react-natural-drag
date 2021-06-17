// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import AddingThings from './src/on-before-capture/adding-things';

storiesOf('onBeforeCapture', module).add('adding things', () => (
  <AddingThings />
));
