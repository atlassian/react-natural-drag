// @flow
import * as React from 'react';
import { useState } from 'react';
import { render } from '@testing-library/react';
import App from '../../util/app';
import {
  Droppable,
  Draggable,
  DragDropContext,
  type DragStart,
} from '../../../../../src';
import expandedMouse from '../../util/expanded-mouse';
import { isDragging } from '../../util/helpers';
import { withError } from '../../../../util/console';
import { noop } from '../../../../../src/empty';

it('should allow for additions to be made', () => {
  // adding a new Droppable and Draggable
  function AnotherChunk() {
    return (
      <Droppable droppableId="addition">
        {(droppableProvided) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
          >
            <Draggable draggableId="addition-item" index={0}>
              {(provided) => (
                <div
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                >
                  Drag me!
                </div>
              )}
            </Draggable>
            {droppableProvided.placeholder};
          </div>
        )}
      </Droppable>
    );
  }

  function Root() {
    const [showAdditions, setShowAdditions] = useState(false);
    function onBeforeCapture() {
      setShowAdditions(true);
    }

    return (
      <App
        onBeforeCapture={onBeforeCapture}
        anotherChild={showAdditions ? <AnotherChunk /> : null}
      />
    );
  }

  const { getByTestId } = render(<Root />);
  const handle: HTMLElement = getByTestId('0');

  // act(() => {}); is joining the two into one update which is
  // causing unexpected mounting behaviour
  withError(() => {
    expandedMouse.rawPowerLift(handle, { x: 0, y: 0 });
  });

  expect(isDragging(handle)).toBe(true);
});

function getIndex(el: HTMLElement): number {
  return Number(el.getAttribute('data-index'));
}

it('should adjust captured values for any changes that impact that dragging item', () => {
  jest.useFakeTimers();
  // 1. Changing the `type` of the Droppable
  // 2. Adding and item before the dragging item to impact it's index
  const onDragStart = jest.fn();

  function Root() {
    const [items, setItems] = useState(['initial']);
    function onBeforeCapture() {
      // adding the first item
      setItems(['first', 'initial']);
    }

    return (
      <DragDropContext
        onDragEnd={noop}
        onBeforeCapture={onBeforeCapture}
        onDragStart={onDragStart}
      >
        <Droppable droppableId="droppable">
          {(droppableProvided) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {items.map((item: string, index: number) => (
                <Draggable draggableId={item} index={index} key={item}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-index={index}
                      data-testid={item}
                      data-is-dragging={snapshot.isDragging}
                      ref={provided.innerRef}
                    >
                      Drag me!
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder};
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  const { getByTestId, queryByTestId } = render(<Root />);
  const initial: HTMLElement = getByTestId('initial');

  // initially it had an index of 1
  expect(getIndex(initial)).toBe(0);
  // first item does not exist yet
  expect(queryByTestId('first')).toBe(null);

  // act(() => {}); is joining the two into one update which is
  // causing unexpected mounting behaviour
  withError(() => {
    expandedMouse.rawPowerLift(initial, { x: 0, y: 0 });
  });

  // first item has been added
  expect(queryByTestId('first')).toBeTruthy();
  // initial is now dragging
  expect(isDragging(initial)).toBe(true);
  // initial index accounts for addition
  expect(getIndex(initial)).toBe(1);

  // flush onDragStart timer
  jest.runOnlyPendingTimers();

  // onDragStart called with correct new index
  const expected: DragStart = {
    draggableId: 'initial',
    mode: 'FLUID',
    type: 'DEFAULT',
    source: {
      index: 1,
      droppableId: 'droppable',
    },
  };
  expect(onDragStart.mock.calls[0][0]).toEqual(expected);

  jest.useRealTimers();
});
