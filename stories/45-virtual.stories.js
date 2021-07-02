// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import ReactWindowList from './src/virtual/react-window/list';
import ReactVirtualizedList from './src/virtual/react-virtualized/list';
import { getQuotes } from './src/data';
import ReactWindowBoard from './src/virtual/react-window/board';
import ReactVirtualizedBoard from './src/virtual/react-virtualized/board';
import ReactVirtualizedWithCellMeasurerBoard from './src/virtual/react-virtualized/cell-measurer';
import ReactVirtualizedWindowList from './src/virtual/react-virtualized/window-list';

storiesOf('Virtual: react-window', module)
  .add('list', () => <ReactWindowList initial={getQuotes(1000)} />)
  .add('board', () => <ReactWindowBoard />);

storiesOf('Virtual: react-virtualized', module)
  .add('list', () => <ReactVirtualizedList initial={getQuotes(1000)} />)
  .add('board', () => <ReactVirtualizedBoard />)
  .add('cell measurer', () => <ReactVirtualizedWithCellMeasurerBoard />)
  .add('window list', () => (
    <ReactVirtualizedWindowList initial={getQuotes(1000)} />
  ));
