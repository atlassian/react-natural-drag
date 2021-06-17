// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import FunnyDrop from './src/custom-drop/funny-drop';
import NoDrop from './src/custom-drop/no-drop';

storiesOf('Custom drop animation', module)
  .add('funny drop animation', () => <FunnyDrop />)
  .add('no drop animation', () => <NoDrop />);
