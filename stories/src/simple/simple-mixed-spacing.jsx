// disabling flowtype to keep this example super simple
// It matches
/* eslint-disable flowtype/require-valid-file-annotation */

import * as React from 'react';
import { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from '../../../src';

// fake data generator
const getItems = (count) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const withAssortedSpacing = () => ({
  // margin
  marginTop: 10,
  // not allowing margin collapsing
  // marginBottom: 20,
  marginLeft: 30,
  marginRight: 40,
  // padding
  paddingTop: 10,
  paddingBottom: 20,
  paddingLeft: 30,
  paddingRight: 40,
  // border
  borderStyle: 'solid',
  borderColor: 'purple',
  borderTopWidth: 2,
  borderBottomWidth: 4,
  borderLeftWidth: 6,
  borderRightWidth: 8,
});

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  ...withAssortedSpacing(),

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'pink',

  // styles we need to apply on draggables
  ...draggableStyle,
});

export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      items: getItems(10),
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index,
    );

    this.setState({
      items,
    });
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              style={{
                width: 250,
                background: 'lightblue',

                ...withAssortedSpacing(),
                // no margin collapsing
                marginTop: 0,
              }}
            >
              {this.state.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(draggableProvided, draggableSnapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      style={getItemStyle(
                        draggableSnapshot.isDragging,
                        draggableProvided.draggableProps.style,
                      )}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
