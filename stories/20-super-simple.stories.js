// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Simple from './src/simple/simple';
import SimpleWithScroll from './src/simple/simple-scrollable';
import WithMixedSpacing from './src/simple/simple-mixed-spacing';

storiesOf('Super simple', module)
  .add('vertical list', () => <Simple />)
  .add('vertical list with scroll (overflow: auto)', () => (
    <SimpleWithScroll overflow="auto" />
  ))
  .add('vertical list with scroll (overflow: scroll)', () => (
    <SimpleWithScroll overflow="scroll" />
  ))
  .add('with mixed spacing', () => <WithMixedSpacing />);
