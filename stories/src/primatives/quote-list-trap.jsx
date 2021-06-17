// @flow
import React, { Fragment } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { Droppable, Draggable } from '../../../src';
import QuoteItem from './quote-item';
import { grid } from '../constants';
import Title from './title';
import type { Quote } from '../types';
import type {
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
  MovementMode,
} from '../../../src';

export const getBackgroundColor = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean,
): string => {
  if (isDraggingOver) {
    return colors.R50;
  }
  if (isDraggingFrom) {
    return colors.T50;
  }
  return colors.N30;
};

const Wrapper = styled.div`
  background-color: ${props =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : 'inherit')};
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 250px;
`;

const scrollContainerHeight: number = 250;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;
  position: relative;

  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`;

const ScrollContainer = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: ${scrollContainerHeight}px;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div``;
/* stylelint-enable */

type Props = {|
  listId?: string,
  listType?: string,
  quotes: Quote[],
  title?: string,
  internalScroll?: boolean,
  scrollContainerStyle?: Object,
  isDropDisabled?: boolean,
  isCombineEnabled?: boolean,
  style?: Object,
  // may not be provided - and might be null
  ignoreContainerClipping?: boolean,
  useClone?: boolean,
  getItemStyle: (
    draggableStyle: Object,
    mode: ?MovementMode,
    draggableId: string,
  ) => void,
|};

type QuoteListProps = {|
  quotes: Quote[],
  getItemStyle: (
    draggableStyle: Object,
    mode: ?MovementMode,
    draggableId: string,
  ) => void,
|};

const InnerQuoteList = React.memo(function InnerQuoteList(
  props: QuoteListProps,
) {
  const { getItemStyle } = props;
  return props.quotes.map((quote: Quote, index: number) => (
    <Draggable key={quote.id} draggableId={quote.id} index={index}>
      {(
        dragProvided: DraggableProvided,
        dragSnapshot: DraggableStateSnapshot,
      ) => (
        <QuoteItem
          key={quote.id}
          quote={quote}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
          style={getItemStyle(
            dragProvided.draggableProps.style,
            dragSnapshot.mode,
            quote.id,
          )}
        />
      )}
    </Draggable>
  ));
});

type InnerListProps = {|
  dropProvided: DroppableProvided,
  quotes: Quote[],
  title: ?string,
  getItemStyle: (
    draggableStyle: Object,
    mode: ?MovementMode,
    draggableId: string,
  ) => void,
|};

function InnerList(props: InnerListProps) {
  const { quotes, dropProvided, getItemStyle } = props;
  const title = props.title ? <Title>{props.title}</Title> : null;

  return (
    <Container>
      {title}
      <DropZone ref={dropProvided.innerRef}>
        <InnerQuoteList quotes={quotes} getItemStyle={getItemStyle} />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function QuoteList(props: Props) {
  const {
    ignoreContainerClipping,
    internalScroll,
    scrollContainerStyle,
    isDropDisabled,
    isCombineEnabled,
    listId = 'LIST',
    listType,
    style,
    quotes,
    title,
    useClone,
    getItemStyle,
  } = props;

  return (
    <Droppable
      droppableId={listId}
      type={listType}
      ignoreContainerClipping={ignoreContainerClipping}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      renderClone={
        useClone
          ? (provided, snapshot, descriptor) => (
              <QuoteItem
                quote={quotes[descriptor.source.index]}
                provided={provided}
                isDragging={snapshot.isDragging}
                isClone
                style={getItemStyle(
                  provided.draggableProps.style,
                  snapshot.mode,
                  quotes[descriptor.source.index].id,
                )}
              />
            )
          : null
      }
    >
      {(
        dropProvided: DroppableProvided,
        dropSnapshot: DroppableStateSnapshot,
      ) => (
        <Wrapper
          style={style}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={isDropDisabled}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
        >
          {internalScroll ? (
            <ScrollContainer style={scrollContainerStyle}>
              <InnerList
                quotes={quotes}
                title={title}
                dropProvided={dropProvided}
                getItemStyle={getItemStyle}
              />
            </ScrollContainer>
          ) : (
            <Fragment>
              <InnerList
                quotes={quotes}
                title={title}
                dropProvided={dropProvided}
                getItemStyle={getItemStyle}
              />
            </Fragment>
          )}
        </Wrapper>
      )}
    </Droppable>
  );
}
