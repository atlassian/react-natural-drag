// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import WithControls from './src/programmatic/with-controls';
import Runsheet from './src/programmatic/runsheet';
import { quotes } from './src/data';

storiesOf('Programmatic dragging', module)
  .add('with controls', () => <WithControls initial={quotes.slice(0, 3)} />)
  .add('with runsheet', () => <Runsheet initial={quotes} />);
