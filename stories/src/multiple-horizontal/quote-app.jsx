// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { DragDropContext } from '../../../src';
import AuthorList from '../primatives/author-list';
import { grid } from '../constants';
import { reorderQuoteMap } from '../reorder';
import type { ReorderQuoteMapResult } from '../reorder';
import type { QuoteMap } from '../types';
import type { DropResult } from '../../../src/types';

const Root = styled.div`
  background-color: ${colors.B200};
  box-sizing: border-box;
  padding: ${grid * 2}px;
  min-height: 100vh;

  /* flexbox */
  display: flex;
  flex-direction: column;
`;

type Props = {|
  initial: QuoteMap,
|};

type State = ReorderQuoteMapResult;

export default class QuoteApp extends Component<Props, State> {
  /* eslint-disable react/sort-comp */

  state: State = {
    quoteMap: this.props.initial,
  };

  onDragEnd = (result: DropResult) => {
    // // dropped outside the list
    if (!result.destination) {
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
    const { quoteMap } = this.state;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Root>
          {Object.keys(quoteMap).map((key: string) => (
            <AuthorList
              internalScroll
              key={key}
              listId={key}
              listType="CARD"
              quotes={quoteMap[key]}
            />
          ))}
        </Root>
      </DragDropContext>
    );
  }
}
