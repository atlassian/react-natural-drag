/* eslint-disable no-restricted-syntax */
// @flow
import * as React from 'react';
import styled from '@emotion/styled';
import QuoteList from '../primatives/quote-list';
import { DragDropContext } from '../../../src';
import { generateQuoteMap, authors } from '../data';
import { reorderQuoteMap } from '../reorder';
import { grid } from '../constants';
import type { Quote, QuoteMap, Author } from '../types';
import type { DropResult, DragUpdate } from '../../../src/types';

const initial: QuoteMap = generateQuoteMap(0);

const ControlSection = styled.div`
  margin: ${grid * 4}px;
`;

class Controls extends React.Component<{|
  changeBy: number,
  isCombineEnabled: boolean,
  onChangeByChange: (changeBy: number) => void,
  onCombineChange: () => void,
|}> {
  render() {
    return (
      <ControlSection>
        <h2>Add or remove items</h2>
        <ul>
          <li>
            <strong>
              <kbd>b</kbd>
            </strong>
            : add to <strong>start</strong> of list
          </li>
          <li>
            <strong>
              <kbd>a</kbd>
            </strong>
            : add to <strong>end</strong> of list
          </li>
          <li>
            <strong>
              <kbd>s</kbd>
            </strong>
            : remove from <strong>start</strong> of list
          </li>
          <li>
            <strong>
              <kbd>d</kbd>
            </strong>
            : remove from <strong>end</strong> of list
          </li>
        </ul>
        <br />
        Change by:{' '}
        <input
          type="number"
          min="1"
          max="10"
          value={this.props.changeBy}
          onChange={(event: SyntheticInputEvent<HTMLInputElement>) =>
            this.props.onChangeByChange(Number(event.target.value))
          }
        />
        <h2>Combine items</h2>
        <p>
          Can items be combined?{' '}
          <input
            type="checkbox"
            checked={this.props.isCombineEnabled}
            onChange={this.props.onCombineChange}
          />
        </p>
      </ControlSection>
    );
  }
}

type State = {|
  quoteMap: QuoteMap,
  changeBy: number,
  isCombineEnabled: boolean,
|};

const Container = styled.div`
  display: flex;
  align-items: flex-start;
`;

const createQuote = (() => {
  let count: number = 0;

  return (): Quote => {
    const id: string = `generated-${++count}`;
    const author: Author = authors[count % authors.length];

    const quote: Quote = {
      id,
      content: 'Generated',
      author,
    };

    return quote;
  };
})();

export default class WithControls extends React.Component<*, State> {
  state: State = {
    quoteMap: initial,
    changeBy: 2,
    isCombineEnabled: false,
  };

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyDown);
  }

  onWindowKeyDown = (event: KeyboardEvent) => {
    // Event used as a part of drag and drop
    if (event.defaultPrevented) {
      return;
    }

    const quoteMap: QuoteMap = this.state.quoteMap;

    // eslint-disable-next-line no-console
    console.log('event.key', event.key);

    // Add quote to start of list ('before')
    if (event.key === 'b') {
      // eslint-disable-next-line no-console
      console.log(`Adding ${this.state.changeBy} to start`);
      const map: QuoteMap = Object.keys(quoteMap).reduce(
        (previous: QuoteMap, key: string): QuoteMap => {
          const quotes: Quote[] = quoteMap[key];
          const additions: Quote[] = Array.from(
            { length: this.state.changeBy },
            () => createQuote(),
          );
          previous[key] = [...additions, ...quotes];
          return previous;
        },
        {},
      );

      this.setState({
        quoteMap: map,
      });
      return;
    }

    // Add quote to end of list ('after')
    if (event.key === 'a') {
      // eslint-disable-next-line no-console
      console.log(`Adding ${this.state.changeBy} to end`);
      const map: QuoteMap = Object.keys(quoteMap).reduce(
        (previous: QuoteMap, key: string): QuoteMap => {
          const quotes: Quote[] = quoteMap[key];
          const additions: Quote[] = Array.from(
            { length: this.state.changeBy },
            () => createQuote(),
          );
          previous[key] = [...quotes, ...additions];
          return previous;
        },
        {},
      );

      this.setState({
        quoteMap: map,
      });
      return;
    }

    // Remove quote from end of list
    if (event.key === 'd') {
      // eslint-disable-next-line no-console
      console.log(`Removing ${this.state.changeBy} from end`);
      const map: QuoteMap = Object.keys(quoteMap).reduce(
        (previous: QuoteMap, key: string): QuoteMap => {
          const quotes: Quote[] = quoteMap[key];
          previous[key] = quotes.length
            ? quotes.slice(0, quotes.length - this.state.changeBy)
            : [];
          return previous;
        },
        {},
      );

      this.setState({
        quoteMap: map,
      });
      return;
    }

    // Remove quote from start of list
    if (event.key === 's') {
      // eslint-disable-next-line no-console
      console.log(`Removing ${this.state.changeBy} from start`);
      const map: QuoteMap = Object.keys(quoteMap).reduce(
        (previous: QuoteMap, key: string): QuoteMap => {
          const quotes: Quote[] = quoteMap[key];
          previous[key] = quotes.length
            ? quotes.slice(this.state.changeBy, quotes.length)
            : [];
          return previous;
        },
        {},
      );

      this.setState({
        quoteMap: map,
      });
    }
  };

  onDragUpdate = (update: DragUpdate) => {
    // eslint-disable-next-line no-console
    console.log(
      'Update: current index =>',
      update.destination ? update.destination.index : null,
    );
  };

  onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    this.setState(
      reorderQuoteMap({
        quoteMap: this.state.quoteMap,
        source: result.source,
        destination: result.destination,
      }),
    );
  };

  render() {
    const { quoteMap, isCombineEnabled, changeBy } = this.state;
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onDragUpdate={this.onDragUpdate}
      >
        <Controls
          changeBy={changeBy}
          isCombineEnabled={isCombineEnabled}
          onChangeByChange={(value: number) =>
            this.setState({ changeBy: value })
          }
          onCombineChange={() =>
            this.setState({ isCombineEnabled: !this.state.isCombineEnabled })
          }
        />
        <Container>
          {Object.keys(quoteMap).map((key: string) => (
            <QuoteList
              key={key}
              listId={key}
              quotes={quoteMap[key]}
              style={{ border: '3px solid blue', paddingBottom: grid }}
              scrollContainerStyle={{ height: 300, border: '3px solid green' }}
              internalScroll
              isCombineEnabled={isCombineEnabled}
            />
          ))}
        </Container>
      </DragDropContext>
    );
  }
}
