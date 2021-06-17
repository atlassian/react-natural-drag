// @flow
import * as React from 'react';
import { getRect } from 'css-box-model';
import { render } from '@testing-library/react';
import type {
  DraggableProvided,
  DroppableProvided,
  DragStart,
  DragUpdate,
  DropResult,
} from '../../../src';
import type { Responders } from '../../../src/types';
import { DragDropContext, Droppable, Draggable } from '../../../src';
import { getComputedSpacing } from '../../util/dimension';
import { simpleLift, keyboard } from './util/controls';

// Both list and item will have the same dimensions
jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() =>
  getRect({
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  }),
);

// Stubbing out totally - not including margins in this
jest
  .spyOn(window, 'getComputedStyle')
  .mockImplementation(() => getComputedSpacing({}));

type State = {|
  isDropDisabled: boolean,
|};

class App extends React.Component<*, State> {
  state: State = {
    isDropDisabled: false,
  };

  onDragStart = (start: DragStart) => {
    this.props.onDragStart(start);
    this.setState({ isDropDisabled: true });
  };

  onDragUpdate = (update: DragUpdate) => {
    this.props.onDragUpdate(update);
  };

  onDragEnd = (result: DropResult) => {
    this.props.onDragEnd(result);
    this.setState({ isDropDisabled: false });
  };
  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="droppable"
          direction="horizontal"
          isDropDisabled={this.state.isDropDisabled}
        >
          {(droppableProvided: DroppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              <Draggable draggableId="draggable" index={0}>
                {(draggableProvided: DraggableProvided) => (
                  <div
                    ref={draggableProvided.innerRef}
                    data-testid="drag-handle"
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    Drag me!
                  </div>
                )}
              </Draggable>
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

jest.useFakeTimers();

it('should allow the disabling of a droppable in onDragStart', () => {
  const responders: Responders = {
    onDragStart: jest.fn(),
    onDragUpdate: jest.fn(),
    onDragEnd: jest.fn(),
  };
  const { getByTestId } = render(<App {...responders} />);
  const handle: HTMLElement = getByTestId('drag-handle');

  simpleLift(keyboard, handle);
  // flush responder
  jest.runOnlyPendingTimers();

  const start: DragStart = {
    draggableId: 'draggable',
    source: {
      droppableId: 'droppable',
      index: 0,
    },
    type: 'DEFAULT',
    mode: 'SNAP',
  };
  expect(responders.onDragStart).toHaveBeenCalledWith(start);

  // onDragUpdate will occur after setTimeout
  expect(responders.onDragUpdate).not.toHaveBeenCalled();

  jest.runOnlyPendingTimers();
  // an update should be fired as the home location has changed
  const update: DragUpdate = {
    ...start,
    // no destination as it is now disabled
    destination: null,
    combine: null,
  };
  expect(responders.onDragUpdate).toHaveBeenCalledWith(update);
});
