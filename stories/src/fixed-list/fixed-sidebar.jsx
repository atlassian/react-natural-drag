// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import type { Quote } from '../types';
import { grid } from '../constants';
import { getQuotes } from '../data';
import QuoteItem from '../primatives/quote-item';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DroppableProvided,
} from '../../../src';

const sidebarWidth: number = 300;

const Title = styled.h2`
  text-align: center;
  padding-top: ${grid * 3}px;
  margin-bottom: ${grid * 3}px;
`;

const SidebarContainer = styled.div`
  width: ${sidebarWidth}px;
  height: 100vh;
  overflow: auto;
  background-color: ${colors.B50};
  position: fixed;
`;

type ListProps = {|
  quotes: Quote[],
|};

const sidebarPortal: HTMLElement = document.createElement('div');
sidebarPortal.classList.add('sidebar-portal');

if (!document.body) {
  throw new Error('body not ready for portal creation!');
}

document.body.appendChild(sidebarPortal);

class Sidebar extends React.Component<ListProps> {
  render() {
    return (
      <SidebarContainer>
        <Title>Fixed sidebar</Title>
        <Droppable droppableId="sidebar">
          {(droppableProvided: DroppableProvided) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {this.props.quotes.map((quote: Quote, index: number) => (
                <Draggable draggableId={quote.id} index={index} key={quote.id}>
                  {(
                    draggableProvided: DraggableProvided,
                    draggableSnapshot: DraggableStateSnapshot,
                  ) => {
                    const usePortal: boolean = draggableSnapshot.isDragging;

                    const child: React.Node = (
                      <QuoteItem
                        quote={quote}
                        isDragging={draggableSnapshot.isDragging}
                        provided={draggableProvided}
                      />
                    );
                    if (!usePortal) {
                      return child;
                    }
                    return ReactDOM.createPortal(child, sidebarPortal);
                  }}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </SidebarContainer>
    );
  }
}

const ContentContainer = styled.div`
  margin-left: ${sidebarWidth}px;
`;

const ContentList = styled.div`
  width: ${sidebarWidth}px;
  margin: 0 auto;
`;

class Content extends React.Component<ListProps> {
  render() {
    return (
      <ContentContainer>
        <Title>Scrollable body</Title>
        <p>Current limitation: they cannot be connected</p>
        <Droppable droppableId="content" type="fixed">
          {(droppableProvided: DroppableProvided) => (
            <ContentList
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {this.props.quotes.map((quote: Quote, index: number) => (
                <Draggable draggableId={quote.id} index={index} key={quote.id}>
                  {(
                    draggableProvided: DraggableProvided,
                    draggableSnapshot: DraggableStateSnapshot,
                  ) => (
                    <QuoteItem
                      quote={quote}
                      isDragging={draggableSnapshot.isDragging}
                      provided={draggableProvided}
                    />
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </ContentList>
          )}
        </Droppable>
      </ContentContainer>
    );
  }
}

type State = {|
  inSidebar: Quote[],
  inContent: Quote[],
|};

const initial: State = {
  inSidebar: getQuotes(40),
  inContent: getQuotes(100),
};

export default class App extends React.Component<*, State> {
  state: State = initial;

  onDragEnd = (result: DropResult) => {
    // eslint-disable-next-line no-console
    console.log('TODO: reorder', result);
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <React.Fragment>
          <Sidebar quotes={this.state.inSidebar} />
          <Content quotes={this.state.inContent} />
        </React.Fragment>
      </DragDropContext>
    );
  }
}
