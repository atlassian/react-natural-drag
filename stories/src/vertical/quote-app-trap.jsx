// @flow
import React, { useState } from 'react';
import styled from '@emotion/styled';
import type { Quote } from '../types';
import type { DropResult, MovementMode } from '../../../src/types';
import { DragDropContext } from '../../../src';
import QuoteListTrap from '../primatives/quote-list-trap';
import reorder from '../reorder';
import { grid } from '../constants';

const Root = styled.div`
  /* flexbox */
  padding-top: ${grid * 2}px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

type Props = {|
  initial: Quote[],
  isCombineEnabled?: boolean,
  listStyle?: Object,
|};

export default function QuoteApp(props: Props) {
  const [quotes, setQuotes] = useState(() => props.initial);

  function onDragStart() {
    // Add a little vibration if the browser supports it.
    // Add's a nice little physical feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  }

  function onDragEnd(result: DropResult) {
    // combining item
    if (result.combine) {
      // super simple: just removing the dragging item
      const newQuotes: Quote[] = [...quotes];
      newQuotes.splice(result.source.index, 1);
      setQuotes(newQuotes);
      return;
    }

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const newQuotes = reorder(
      quotes,
      result.source.index,
      result.destination.index,
    );

    setQuotes(newQuotes);
  }

  function getItemStyle(
    draggableStyle: Object,
    mode: ?MovementMode,
    draggableId: string,
  ) {
    if (mode !== 'FLUID') {
      return draggableStyle;
    }
    const previousYAttr = 'data-rbd-drag-draggable-currentY';
    const queryAttr = 'data-rbd-drag-handle-draggable-id';
    const domQuery = `[${queryAttr}='${draggableId}']`;
    const draggedDOM = (document.querySelector(domQuery): ?Element);
    const { transform } = draggableStyle;
    let activeTransform = {};

    if (transform && draggedDOM) {
      const containerDOM = (draggedDOM.parentElement: ?Element);
      const { top, height } = draggedDOM.getBoundingClientRect() || {};

      const previousY = `${draggedDOM.getAttribute(previousYAttr) || '0'}`;
      const currentY = transform.substring(
        transform.indexOf(',') + 1,
        transform.indexOf(')'),
      );

      activeTransform = {
        transform: `translate(0, ${previousY})`,
      };

      if (containerDOM) {
        const { top: availableTop, height: availableHeight } =
          containerDOM.getBoundingClientRect() || {};

        const isMoreThenMin = top - availableTop >= 0;
        const isLessThenMax = top - availableTop + height <= availableHeight;
        const previous = parseInt(previousY, 10);
        const current = parseInt(currentY, 10);
        if (
          (isMoreThenMin && isLessThenMax) ||
          (!isMoreThenMin && previous < current) ||
          (!isLessThenMax && previous > current)
        ) {
          draggedDOM.setAttribute(previousYAttr, currentY);
          activeTransform = {
            transform: `translate(0, ${currentY})`,
          };
        }
      }
    }
    return {
      ...draggableStyle,
      ...activeTransform,
    };
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Root>
        <QuoteListTrap
          listId="list"
          style={props.listStyle}
          quotes={quotes}
          isCombineEnabled={props.isCombineEnabled}
          getItemStyle={getItemStyle}
        />
      </Root>
    </DragDropContext>
  );
}
