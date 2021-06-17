// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import QuoteApp from './src/multiple-horizontal/quote-app';
import { getQuotes } from './src/data';
import type { QuoteMap } from './src/types';

const alpha: string = 'alpha';
const beta: string = 'beta';
const gamma: string = 'gamma';

const quoteMap: QuoteMap = {
  [alpha]: getQuotes(20),
  [beta]: getQuotes(18),
  [gamma]: getQuotes(22),
};

storiesOf('multiple horizontal lists', module).add('stress test', () => (
  <QuoteApp initial={quoteMap} />
));
