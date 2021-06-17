// @flow
/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import { Component } from 'react';
import { render } from '@testing-library/react';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';
import { Droppable, Draggable, DragDropContext } from '../../../../src';
import type { DraggableProvided, DroppableProvided } from '../../../../src';

type AppState = {|
  foo: string,
  // Needed to appease react-redux connect type
  // eslint-disable-next-line react/no-unused-prop-types
  dispatch?: () => void,
|};
const original: AppState = {
  foo: 'bar',
};
// super boring reducer that always returns the same thing
const reducer = (state?: AppState = original) => state;
const store = createStore(reducer);

class Unconnected extends Component<AppState> {
  render() {
    return <div>{this.props.foo}</div>;
  }
}

function mapStateToProps(state: AppState): AppState {
  return state;
}

const Connected = connect(mapStateToProps)(Unconnected);

it('should avoid clashes with parent redux applications', () => {
  class App extends Component<*> {
    render() {
      return (
        <Provider store={store}>
          <DragDropContext onDragEnd={() => {}}>
            <Droppable droppableId="droppable">
              {(droppableProvided: DroppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                >
                  <Draggable draggableId="draggableId" index={0}>
                    {(draggableProvided: DraggableProvided) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.dragHandleProps}
                        {...draggableProvided.draggableProps}
                      >
                        <Connected />
                      </div>
                    )}
                  </Draggable>
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      );
    }
  }
  const { container, unmount } = render(<App />);

  expect(container.textContent).toBe(original.foo);

  unmount();
});

it('should avoid clashes with child redux applications', () => {
  class App extends Component<*> {
    render() {
      return (
        <DragDropContext onDragEnd={() => {}}>
          <Droppable droppableId="droppable">
            {(droppableProvided: DroppableProvided) => (
              <div
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                <Draggable draggableId="draggableId" index={0}>
                  {(draggableProvided: DraggableProvided) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.dragHandleProps}
                      {...draggableProvided.draggableProps}
                    >
                      <Provider store={store}>
                        <Connected />
                      </Provider>
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
  const { container } = render(<App />);

  expect(container.textContent).toBe(original.foo);
});
