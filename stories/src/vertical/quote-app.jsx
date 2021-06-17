// @flow
import * as React from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import type { Quote } from '../types';
import type { DropResult } from '../../../src/types';
import { DragDropContext } from '../../../src';
import QuoteList from '../primatives/quote-list';
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

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Root>
        <QuoteList
          listId="list"
          style={props.listStyle}
          quotes={quotes}
          isCombineEnabled={props.isCombineEnabled}
        />
      </Root>
    </DragDropContext>
  );
}
