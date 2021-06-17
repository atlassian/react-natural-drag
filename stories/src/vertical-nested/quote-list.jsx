// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { Droppable, Draggable } from '../../../src';
import QuoteItem from '../primatives/quote-item';
import Title from '../primatives/title';
import { grid } from '../constants';
import type { Quote } from '../types';
import type { NestedQuoteList } from './types';
import type {
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from '../../../src';

// $ExpectError - not sure why
const Root = styled.div`
  width: 250px;
`;

const Container = styled.div`
  background-color: ${({ isDraggingOver }) =>
    isDraggingOver ? colors.B50 : colors.B75};
  display: flex;
  flex-direction: column;
  padding: ${grid}px;
  padding-bottom: 0;
  user-select: none;
  transition: background-color 0.1s ease;

  &:focus {
    outline: 2px solid ${colors.P200};
    outline-offset: 2px;
  }
`;

const NestedContainer = styled(Container)`
  padding: 0;
  margin-bottom: ${grid}px;
`;

export default class QuoteList extends Component<{ list: NestedQuoteList }> {
  renderQuote = (quote: Quote, index: number) => (
    <Draggable key={quote.id} draggableId={quote.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <QuoteItem
          quote={quote}
          isDragging={snapshot.isDragging}
          provided={provided}
        />
      )}
    </Draggable>
  );

  renderList = (list: NestedQuoteList, level?: number = 0) => (
    <Droppable droppableId={list.id} type={list.id} key={list.id}>
      {(
        dropProvided: DroppableProvided,
        dropSnapshot: DroppableStateSnapshot,
      ) => (
        <Container
          ref={dropProvided.innerRef}
          isDraggingOver={dropSnapshot.isDraggingOver}
          {...dropProvided.droppableProps}
        >
          <Title>{list.title}</Title>
          {list.children.map((item: Quote | NestedQuoteList, index: number) =>
            !item.children ? (
              this.renderQuote((item: any), index)
            ) : (
              <Draggable draggableId={item.id} key={item.id} index={index}>
                {(
                  dragProvided: DraggableProvided,
                  dragSnapshot: DraggableStateSnapshot,
                ) => (
                  <NestedContainer
                    ref={dragProvided.innerRef}
                    isDragging={dragSnapshot.isDragging}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    {this.renderList((item: any), level + 1)}
                  </NestedContainer>
                )}
              </Draggable>
            ),
          )}
          {dropProvided.placeholder}
        </Container>
      )}
    </Droppable>
  );

  render() {
    return <Root>{this.renderList(this.props.list)}</Root>;
  }
}
