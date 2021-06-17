// @flow
/* eslint-disable no-console */
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
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

function delay(fn: Function, time?: number = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, time);
  });
}

function noop() {}

function useDemoSensor(api: SensorAPI) {
  const start = useCallback(
    async function start() {
      const preDrag: ?PreDragActions = api.tryGetLock('1', noop);

      if (!preDrag) {
        console.warn('unable to start drag');
        return;
      }
      console.warn('starting drag');

      const actions: SnapDragActions = preDrag.snapLift();
      const { moveDown, moveUp, drop } = actions;

      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveDown);
      await delay(moveUp);
      await delay(moveUp);
      await delay(drop);
    },
    [api],
  );

  useEffect(() => {
    start();
  }, [start]);
}

type Props = {|
  initial: Quote[],
|};

export default function QuoteApp(props: Props) {
  const [quotes, setQuotes] = useState(props.initial);

  const onDragEnd = useCallback(
    function onDragEnd(result: DropResult) {
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

  return (
    <DragDropContext onDragEnd={onDragEnd} sensors={[useDemoSensor]}>
      <QuoteList listId="list" quotes={quotes} />
    </DragDropContext>
  );
}
