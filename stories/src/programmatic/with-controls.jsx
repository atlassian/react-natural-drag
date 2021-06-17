// @flow
/* eslint-disable no-console */
import * as React from 'react';
import { useRef, createRef, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Quote } from '../types';
import type {
  DropResult,
  PreDragActions,
  SnapDragActions,
  SensorAPI,
} from '../../../src/types';
import { DragDropContext } from '../../../src';
import QuoteList from '../primatives/quote-list';
import reorder from '../reorder';
import { grid, borderRadius } from '../constants';

type ControlProps = {|
  quotes: Quote[],
  canLift: boolean,
  isDragging: boolean,
  lift: (quoteId: string) => ?SnapDragActions,
|};

function noop() {}

const ControlBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArrowBox = styled.div`
  margin-top: ${grid * 4}px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  --off-white: hsla(60, 100%, 98%, 1);
  --dark-off-white: #efefe3;
  --darker-off-white: #d6d6cb;
  --border-width: 4px;

  background: var(--off-white);
  border-radius: ${borderRadius}px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 16px;
  position: relative;
  box-sizing: border-box;
  border: var(--border-width) solid var(--dark-off-white);
  box-shadow: 0 0 0 1px var(--darker-off-white);
  margin: 2px;

  ::before {
    position: absolute;
    content: ' ';
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 1px solid var(--dark-off-white);
  }

  :active {
    border-width: 3px;
  }
`;

const ArrowButton = styled(Button)`
  width: 40px;
  height: 40px;
`;

// locking the height so that the border width change
// does not change the size of the button
const ActionButton = styled(Button)`
  height: 40px;
`;

function Controls(props: ControlProps) {
  const { quotes, canLift, isDragging, lift } = props;
  const actionsRef = useRef<?SnapDragActions>(null);

  const selectRef = createRef();

  function maybe(fn: (callbacks: SnapDragActions) => void) {
    if (actionsRef.current) {
      fn(actionsRef.current);
    }
  }

  return (
    <ControlBox>
      <select disabled={!canLift} ref={selectRef}>
        {quotes.map((quote: Quote) => (
          <option key={quote.id} value={quote.id}>
            id: {quote.id}
          </option>
        ))}
      </select>
      <ActionButton
        type="button"
        disabled={!canLift}
        onClick={() => {
          const select: ?HTMLSelectElement = selectRef.current;
          if (!select) {
            return;
          }

          actionsRef.current = lift(select.value);
        }}
      >
        Lift{' '}
        <span role="img" aria-label="lift">
          🏋️‍♀️
        </span>
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() =>
          maybe((callbacks: SnapDragActions) => {
            actionsRef.current = null;
            callbacks.drop();
          })
        }
        disabled={!isDragging}
      >
        Drop{' '}
        <span role="img" aria-label="drop">
          🤾‍♂️
        </span>
      </ActionButton>
      <ArrowBox>
        <ArrowButton
          type="button"
          onClick={() =>
            maybe((callbacks: SnapDragActions) => callbacks.moveUp())
          }
          disabled={!isDragging}
          label="up"
        >
          ↑
        </ArrowButton>
        <div>
          <ArrowButton type="button" disabled={!isDragging} label="left">
            ←
          </ArrowButton>
          <ArrowButton
            type="button"
            onClick={() =>
              maybe((callbacks: SnapDragActions) => callbacks.moveDown())
            }
            disabled={!isDragging}
            label="down"
          >
            ↓
          </ArrowButton>
          <ArrowButton type="button" disabled={!isDragging} label="right">
            →
          </ArrowButton>
        </div>
      </ArrowBox>
    </ControlBox>
  );
}

const Layout = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${grid * 4}px;

  > * {
    margin: ${grid}px;
  }
`;

type Props = {|
  initial: Quote[],
|};

export default function QuoteApp(props: Props) {
  const [quotes, setQuotes] = useState(props.initial);
  const [isDragging, setIsDragging] = useState(false);
  const [isControlDragging, setIsControlDragging] = useState(false);
  const sensorAPIRef = useRef<?SensorAPI>(null);

  const onDragEnd = useCallback(
    function onDragEnd(result: DropResult) {
      setIsDragging(false);
      setIsControlDragging(false);
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
    },
    [quotes],
  );

  function lift(quoteId: string): ?SnapDragActions {
    if (isDragging) {
      return null;
    }

    const api: ?SensorAPI = sensorAPIRef.current;

    if (!api) {
      console.warn('unable to find sensor api');
      return null;
    }

    const preDrag: ?PreDragActions = api.tryGetLock(quoteId, noop);

    if (!preDrag) {
      console.log('unable to start capturing');
      return null;
    }
    setIsControlDragging(true);
    return preDrag.snapLift();
  }

  return (
    <DragDropContext
      onDragStart={() => setIsDragging(true)}
      onDragEnd={onDragEnd}
      sensors={[
        (api) => {
          sensorAPIRef.current = api;
        },
      ]}
    >
      <Layout>
        <QuoteList listId="list" quotes={quotes} />
        <Controls
          quotes={quotes}
          canLift={!isDragging}
          isDragging={isControlDragging}
          lift={lift}
        />
      </Layout>
    </DragDropContext>
  );
}
