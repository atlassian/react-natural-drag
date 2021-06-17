// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { DragDropContext } from '../../../src';
import QuoteList from '../primatives/quote-list';
import { grid } from '../constants';
import { reorderQuoteMap } from '../reorder';
import type { ReorderQuoteMapResult } from '../reorder';
import type { QuoteMap } from '../types';
import type { DropResult, DraggableLocation } from '../../../src/types';

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

const Column = styled.div`
  margin: 0 ${grid * 2}px;
`;

const HorizontalScrollContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.1);
  padding: ${grid}px;
  max-width: 400px;
  overflow: auto;
`;

const VerticalScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.1);
  padding: ${grid}px;
  max-height: 800px;
  overflow: auto;
`;

const PushDown = styled.div`
  height: 200px;
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
    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    this.setState(
      reorderQuoteMap({
        quoteMap: this.state.quoteMap,
        source,
        destination,
      }),
    );
  };

  // TODO
  getDisabledDroppable = (sourceDroppable: ?string) => {
    if (!sourceDroppable) {
      return null;
    }

    const droppables: string[] = ['alpha', 'beta', 'gamma', 'delta'];
    const sourceIndex = droppables.indexOf(sourceDroppable);
    const disabledDroppableIndex = (sourceIndex + 1) % droppables.length;

    return droppables[disabledDroppableIndex];
  };

  render() {
    const { quoteMap } = this.state;
    const disabledDroppable = 'TODO';

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Root>
          <HorizontalScrollContainer>
            <Column>
              <QuoteList
                title="alpha"
                listId="alpha"
                listType="card"
                isDropDisabled={disabledDroppable === 'alpha'}
                quotes={quoteMap.alpha}
              />
            </Column>
            <Column>
              <QuoteList
                title="beta"
                listId="beta"
                listType="card"
                isDropDisabled={disabledDroppable === 'beta'}
                quotes={quoteMap.beta}
              />
            </Column>
            <Column>
              <QuoteList
                title="gamma"
                listId="gamma"
                listType="card"
                isDropDisabled={disabledDroppable === 'gamma'}
                quotes={quoteMap.gamma}
              />
            </Column>
          </HorizontalScrollContainer>
          <Column>
            <PushDown />
            <QuoteList
              title="delta"
              listId="delta"
              listType="card"
              isDropDisabled={disabledDroppable === 'delta'}
              quotes={quoteMap.delta}
            />
            <QuoteList
              title="epsilon"
              listId="epsilon"
              listType="card"
              internalScroll
              isDropDisabled={disabledDroppable === 'epsilon'}
              quotes={quoteMap.epsilon}
            />
          </Column>
          <VerticalScrollContainer>
            <Column>
              <QuoteList
                title="zeta"
                listId="zeta"
                listType="card"
                isDropDisabled={disabledDroppable === 'zeta'}
                quotes={quoteMap.zeta}
              />
            </Column>
            <Column>
              <QuoteList
                title="eta"
                listId="eta"
                listType="card"
                isDropDisabled={disabledDroppable === 'eta'}
                quotes={quoteMap.eta}
              />
            </Column>
            <Column>
              <QuoteList
                title="theta"
                listId="theta"
                listType="card"
                isDropDisabled={disabledDroppable === 'theta'}
                quotes={quoteMap.theta}
              />
            </Column>
          </VerticalScrollContainer>
          <Column>
            <QuoteList
              title="iota"
              listId="iota"
              listType="card"
              isDropDisabled={disabledDroppable === 'iota'}
              quotes={quoteMap.iota}
            />
          </Column>
          <Column>
            <QuoteList
              title="kappa"
              listId="kappa"
              listType="card"
              internalScroll
              isDropDisabled={disabledDroppable === 'kappa'}
              quotes={quoteMap.kappa}
            />
          </Column>
        </Root>
      </DragDropContext>
    );
  }
}
