// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { invariant } from '../../../src/invariant';
import { DragDropContext } from '../../../src';
import { grid } from '../constants';
import QuoteList from './quote-list';
import reorder from '../reorder';
import { getQuotes } from '../data';
import type { Quote } from '../types';
import type { NestedQuoteList } from './types';
import type { DropResult } from '../../../src/types';

const quotes: Quote[] = getQuotes(10);

const initialList: NestedQuoteList = {
  id: 'first-level',
  title: 'top level',
  children: [
    ...quotes.slice(0, 2),
    {
      id: 'second-level',
      title: 'second level',
      children: quotes.slice(3, 5),
    },
    ...quotes.slice(6, 9),
  ],
};

const Root = styled.div`
  background-color: ${colors.B200};
  box-sizing: border-box;
  padding: ${grid * 2}px;
  min-height: 100vh;

  /* flexbox */
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

type State = {|
  list: NestedQuoteList,
|};

export default class QuoteApp extends Component<*, State> {
  /* eslint-disable react/sort-comp */
  state: State = {
    list: initialList,
  };
  /* eslint-enable */

  onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.type === 'first-level') {
      const children = reorder(
        this.state.list.children,
        result.source.index,
        result.destination.index,
      );

      const list: NestedQuoteList = {
        ...this.state.list,
        children,
      };

      this.setState({
        list,
      });
      return;
    }

    if (result.type === 'second-level') {
      const nested: ?NestedQuoteList = (this.state.list.children.filter(
        (item: mixed): boolean =>
          Object.prototype.hasOwnProperty.call(item, 'children'),
      )[0]: any);

      invariant(nested, 'could not find nested list');

      const updated: NestedQuoteList = {
        ...nested,
        children: reorder(
          nested.children,
          result.source.index,
          // $ExpectError - already checked for null
          result.destination.index,
        ),
      };

      const nestedIndex = this.state.list.children.indexOf(nested);
      const children = Array.from(this.state.list.children);
      children[nestedIndex] = updated;

      const list: NestedQuoteList = {
        ...this.state.list,
        children,
      };

      this.setState({
        list,
      });
    }
  };

  render() {
    const { list } = this.state;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Root>
          <QuoteList list={list} />
        </Root>
      </DragDropContext>
    );
  }
}
