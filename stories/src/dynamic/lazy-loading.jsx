// @flow
import * as React from 'react';
import QuoteList from '../primatives/quote-list';
import { DragDropContext } from '../../../src';
import type {
  DropResult,
  DragUpdate,
  DraggableLocation,
} from '../../../src/types';
import type { Quote } from '../types';
import { quotes as initial, getQuotes } from '../data';
import reorder from '../reorder';

type State = {|
  quotes: Quote[],
  isLoading: boolean,
|};

export default class LazyLoading extends React.Component<*, State> {
  // eslint-disable-next-line react/sort-comp
  timerId: ?TimeoutID = null;
  state: State = {
    quotes: initial,
    isLoading: false,
  };

  onDragUpdate = (update: DragUpdate) => {
    const destination: ?DraggableLocation = update.destination;
    if (!destination) {
      return;
    }

    const lastIndex: number = this.state.quotes.length - 1;
    const startLoadingFrom: number = lastIndex - 5;

    if (destination.index < startLoadingFrom) {
      return;
    }

    this.startLazyLoading();
  };

  onDragEnd = (result: DropResult) => {
    // Stop any pending lazy loads
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.setState({
      isLoading: false,
    });

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const quotes = reorder(
      this.state.quotes,
      result.source.index,
      result.destination.index,
    );

    this.setState({
      quotes,
    });
  };

  startLazyLoading = () => {
    if (this.state.isLoading) {
      return;
    }

    this.timerId = setTimeout(() => {
      this.timerId = null;

      const additions: Quote[] = getQuotes(4);
      const quotes: Quote[] = [...this.state.quotes, ...additions];
      this.setState({
        quotes,
        isLoading: false,
      });
    }, 10);

    this.setState({
      isLoading: true,
    });
  };

  render() {
    return (
      <DragDropContext
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <QuoteList quotes={this.state.quotes} internalScroll />
      </DragDropContext>
    );
  }
}
