// @flow
/* eslint-disable react/sort-comp */
import * as React from 'react';
import { Component, Fragment } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { DragDropContext, Droppable, Draggable } from '../../../src';
import reorder from '../reorder';
import { grid } from '../constants';
import type { Quote } from '../types';
import type {
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '../../../src';

const Table = styled.table`
  width: 500px;
  margin: 0 auto;
  table-layout: ${(props) => props.layout};
`;

const TBody = styled.tbody`
  border: 0;
`;

const THead = styled.thead`
  border: 0;
  border-bottom: none;
  background-color: ${colors.N10};
`;

const Row = styled.tr`
  ${(props) => (props.isDragging ? `background: ${colors.G100};` : '')};
`;

const Cell = styled.td`
  box-sizing: border-box;
  padding: ${grid}px;
`;

type TableCellProps = {|
  children: React.Node,
  isDragOccurring: boolean,
|};

type TableCellSnapshot = {|
  width: number,
  height: number,
|};
class TableCell extends React.Component<TableCellProps> {
  ref: ?HTMLElement;

  getSnapshotBeforeUpdate(prevProps: TableCellProps): ?TableCellSnapshot {
    if (!this.ref) {
      return null;
    }

    const isDragStarting: boolean =
      this.props.isDragOccurring && !prevProps.isDragOccurring;

    if (!isDragStarting) {
      return null;
    }

    const { width, height } = this.ref.getBoundingClientRect();

    const snapshot: TableCellSnapshot = {
      width,
      height,
    };

    return snapshot;
  }

  componentDidUpdate(
    prevProps: TableCellProps,
    prevState: mixed,
    snapshot: ?TableCellSnapshot,
  ) {
    const ref: ?HTMLElement = this.ref;
    if (!ref) {
      return;
    }

    if (snapshot) {
      if (ref.style.width === snapshot.width) {
        return;
      }
      ref.style.width = `${snapshot.width}px`;
      ref.style.height = `${snapshot.height}px`;
      return;
    }

    if (this.props.isDragOccurring) {
      return;
    }

    // inline styles not applied
    if (ref.style.width == null) {
      return;
    }

    // no snapshot and drag is finished - clear the inline styles
    ref.style.removeProperty('height');
    ref.style.removeProperty('width');
  }

  setRef = (ref: ?HTMLElement) => {
    this.ref = ref;
  };

  render() {
    return <Cell ref={this.setRef}>{this.props.children}</Cell>;
  }
}

type TableRowProps = {|
  quote: Quote,
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot,
|};

const IsDraggingContext = React.createContext<boolean>(false);

class TableRow extends Component<TableRowProps> {
  render() {
    const { snapshot, quote, provided } = this.props;
    return (
      <IsDraggingContext.Consumer>
        {(isDragging: boolean) => (
          <Row
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <TableCell isDragOccurring={isDragging}>
              {quote.author.name}
            </TableCell>
            <TableCell isDragOccurring={isDragging}>{quote.content}</TableCell>
          </Row>
        )}
      </IsDraggingContext.Consumer>
    );
  }
}

// TODO: make this look nicer!
const Header = styled.header`
  display: flex;
  flex-direction: column;
  width: 500px;
  margin: 0 auto;
  margin-bottom: ${grid * 2}px;
`;

/* stylelint-disable block-no-empty */
const LayoutControl = styled.div``;

const CopyTableButton = styled.button``;
/* stylelint-enable */

type AppProps = {|
  initial: Quote[],
|};

type AppState = {|
  quotes: Quote[],
  layout: 'fixed' | 'auto',
  isDragging: boolean,
|};
export default class TableApp extends Component<AppProps, AppState> {
  tableRef: ?HTMLElement;

  state: AppState = {
    quotes: this.props.initial,
    layout: 'auto',
    isDragging: false,
  };

  onBeforeDragStart = () => {
    this.setState({
      isDragging: true,
    });
  };

  onDragEnd = (result: DropResult) => {
    this.setState({
      isDragging: false,
    });

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // no movement
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

  toggleTableLayout = () => {
    this.setState({
      layout: this.state.layout === 'auto' ? 'fixed' : 'auto',
    });
  };

  copyTableToClipboard = () => {
    const tableRef: ?HTMLElement = this.tableRef;
    if (tableRef == null) {
      return;
    }

    const range: Range = document.createRange();
    range.selectNode(tableRef);
    window.getSelection().addRange(range);

    const wasCopied: boolean = (() => {
      try {
        const result: boolean = document.execCommand('copy');
        return result;
      } catch (e) {
        return false;
      }
    })();

    // eslint-disable-next-line no-console
    console.log('was copied?', wasCopied);

    // clear selection
    window.getSelection().removeAllRanges();
  };

  render() {
    return (
      <IsDraggingContext.Provider value={this.state.isDragging}>
        <DragDropContext
          onBeforeDragStart={this.onBeforeDragStart}
          onDragEnd={this.onDragEnd}
        >
          <Fragment>
            <Header>
              <LayoutControl>
                Current layout: <code>{this.state.layout}</code>
                <button type="button" onClick={this.toggleTableLayout}>
                  Toggle
                </button>
              </LayoutControl>
              <div>
                Copy table to clipboard:
                <CopyTableButton onClick={this.copyTableToClipboard}>
                  Copy
                </CopyTableButton>
              </div>
            </Header>
            <Table layout={this.state.layout}>
              <THead>
                <tr>
                  <th>Author</th>
                  <th>Content</th>
                </tr>
              </THead>
              <Droppable droppableId="table">
                {(droppableProvided: DroppableProvided) => (
                  <TBody
                    ref={(ref: ?HTMLElement) => {
                      this.tableRef = ref;
                      droppableProvided.innerRef(ref);
                    }}
                    {...droppableProvided.droppableProps}
                  >
                    {this.state.quotes.map((quote: Quote, index: number) => (
                      <Draggable
                        draggableId={quote.id}
                        index={index}
                        key={quote.id}
                      >
                        {(
                          provided: DraggableProvided,
                          snapshot: DraggableStateSnapshot,
                        ) => (
                          <TableRow
                            provided={provided}
                            snapshot={snapshot}
                            quote={quote}
                          />
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </TBody>
                )}
              </Droppable>
            </Table>
          </Fragment>
        </DragDropContext>
      </IsDraggingContext.Provider>
    );
  }
}
