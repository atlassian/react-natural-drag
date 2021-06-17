// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { Draggable, Droppable, DragDropContext } from '../src';

class App extends React.Component<*> {
  render() {
    return 'Used for debugging codesandbox examples (copy paste them into this file)';
  }
}

storiesOf('Troubleshoot example', module).add('debug example', () => <App />);
