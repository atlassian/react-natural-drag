// @flow
import { colors } from '@atlaskit/theme';
import styled from '@emotion/styled';
import * as React from 'react';
import { useState } from 'react';
import { useMemo } from 'use-memo-one';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '../../../src';
import type { Quote } from '../types';
import { grid } from '../constants';
import { authorQuoteMap } from '../data';
import reorder, { reorderQuoteMap } from '../reorder';

const Parent = styled.div`
  display: flex;
`;

type Width = 'small' | 'large';

type ItemProps = {|
  quote: Quote,
  index: number,
|};

const StyledItem = styled.div`
  border: 1px solid ${colors.N100};
  background: ${colors.G50};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  user-select: none;
`;

function Item(props: ItemProps) {
  const { quote, index } = props;

  return (
    <Draggable draggableId={quote.id} index={index}>
      {(provided) => (
        <StyledItem
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {quote.content}
        </StyledItem>
      )}
    </Draggable>
  );
}

type ListProps = {|
  listId: string,
  quotes: Quote[],
|};

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Controls = styled.div``;

const StyledList = styled.div`
  border: 1px solid ${colors.N100};
  margin: ${grid}px;
  padding: ${grid}px;
  box-sizing: border-box;
  background-color: ${(props) =>
    props.isDraggingOver ? colors.B100 : 'inherit'};
  width: ${(props) => (props.width === 'large' ? 800 : 200)}px;
`;

function List(props: ListProps) {
  const [width, setWidth] = useState<Width>('small');
  return (
    <ListContainer>
      <Controls>
        <button type="button" onClick={() => setWidth('small')}>
          Small
        </button>
        <button type="button" onClick={() => setWidth('large')}>
          Large
        </button>
      </Controls>
      <Droppable droppableId={props.listId}>
        {(provided, snapshot) => (
          <StyledList
            {...provided.droppableProps}
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            width={width}
          >
            {props.quotes.map((quote: Quote, index: number) => (
              <Item key={quote.id} quote={quote} index={index} />
            ))}
            {provided.placeholder}
          </StyledList>
        )}
      </Droppable>
    </ListContainer>
  );
}

export default function App() {
  const [columns, setColumns] = useState(authorQuoteMap);
  const ordered = useMemo(() => Object.keys(columns), [columns]);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    // reordering in same list
    if (source.droppableId === destination.droppableId) {
      const newQuotes: Quote[] = reorder(
        columns[source.droppableId],
        source.index,
        destination.index,
      );
      setColumns({
        ...columns,
        [source.droppableId]: newQuotes,
      });
      return;
    }

    // moving between columns

    // remove item from source list
    const newColumns = reorderQuoteMap({
      quoteMap: columns,
      source,
      destination,
    });

    setColumns(newColumns.quoteMap);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Parent>
        {ordered.map((key: string) => (
          <List listId={key} quotes={columns[key]} key={key} />
        ))}
      </Parent>
    </DragDropContext>
  );
}
