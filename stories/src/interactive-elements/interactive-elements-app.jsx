// @flow
import * as React from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { DragDropContext, Droppable, Draggable } from '../../../src';
import { grid } from '../constants';
import reorder from '../reorder';
import type {
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from '../../../src';

type ItemType = {|
  id: string,
  component: React.Node,
|};

const initial: ItemType[] = [
  {
    id: 'button',
    component: (
      <div>
        <p>Standard</p>
        <button type="button">hello world</button>
        <br />
        <p>
          With child{' '}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content"
            target="_blank"
            rel="noopener noreferrer"
          >
            phrasing content
          </a>
        </p>
        <button type="button">
          why{' '}
          <strong>
            hello <em>there!</em>
          </strong>
        </button>
        <p>
          With child{' '}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/SVGElement"
            target="_blank"
            rel="noopener noreferrer"
          >
            SVGElement
          </a>
        </p>
        <button type="button">
          My circle <br />
          <svg width="40" height="40">
            <circle cx="20" cy="20" r="20" />
          </svg>
        </button>
      </div>
    ),
  },
  {
    id: 'select',
    component: (
      <select>
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
      </select>
    ),
  },
  {
    id: 'textarea',
    component: <textarea placeholder="type some text here" />,
  },
  {
    id: 'input',
    component: (
      <div>
        <input type="text" placeholder="text input" />
      </div>
    ),
  },
  {
    id: 'checkbox',
    component: (
      <div>
        <label htmlFor="myCheckbox1">
          <input id="myCheckbox1" type="checkbox" name="myCheckbox" />
          Checkbox 1
        </label>
        <br />
        <label htmlFor="myCheckbox2">
          <input id="myCheckbox2" type="checkbox" name="myCheckbox" />
          Checkbox 2
        </label>
      </div>
    ),
  },
  {
    id: 'radio',
    component: (
      <div>
        <label htmlFor="myRadio">
          <input id="myRadio1" type="radio" name="myRadio" />
          Option 1
        </label>
        <br />
        <label htmlFor="myRadio">
          <input id="myRadio2" type="radio" name="myRadio" />
          Option 2
        </label>
      </div>
    ),
  },
  {
    id: 'range',
    component: <input type="range" min="1" max="100" />,
  },
  {
    id: 'content editable',
    component: (
      <div
        contentEditable
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            A content editable with
            <strong>my super cool content</strong>
          `,
        }}
      />
    ),
  },
];

const List = styled.div`
  width: 250px;
  background-color: ${colors.B200};
  padding: ${grid * 2}px;
`;

const Item = styled.div`
  min-height: 80px;
  background-color: ${colors.N0};
  border: 1px solid ${colors.N100};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
`;

const Container = styled.div`
  display: flex;
`;

const Controls = styled.div`
  padding: ${grid * 2}px;
  width: 250px;
`;

const Status = styled.strong`
  color: ${({ isEnabled }) => (isEnabled ? colors.B200 : colors.P100)};
`;

type State = {|
  canDragInteractiveElements: boolean,
  items: ItemType[],
|};

export default class InteractiveElementsApp extends React.Component<*, State> {
  state: State = {
    items: initial,
    canDragInteractiveElements: false,
  };

  onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.source.index === result.destination.index) {
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
  };

  toggleBlocking = () => {
    this.setState({
      canDragInteractiveElements: !this.state.canDragInteractiveElements,
    });
  };

  render() {
    const { canDragInteractiveElements } = this.state;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Container>
          <Droppable droppableId="droppable">
            {(droppableProvided: DroppableProvided) => (
              <List
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                {this.state.items.map((item: ItemType, index: number) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    disableInteractiveElementBlocking={
                      canDragInteractiveElements
                    }
                    index={index}
                  >
                    {(draggableProvided: DraggableProvided) => (
                      <Item
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                      >
                        {item.component}
                      </Item>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </List>
            )}
          </Droppable>
          <Controls>
            <p>
              Dragging from interactive elements is{' '}
              <Status isEnabled={canDragInteractiveElements}>
                {canDragInteractiveElements ? 'enabled' : 'disabled'}
              </Status>
            </p>
            <button type="button" onClick={this.toggleBlocking}>
              toggle
            </button>
          </Controls>
        </Container>
      </DragDropContext>
    );
  }
}
