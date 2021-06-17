// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { Draggable } from '../../../src';
import { grid, borderRadius } from '../constants';
import type { DraggableProvided, DraggableStateSnapshot } from '../../../src';
import type { Id, Task as TaskType } from '../types';

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const primaryButton = 0;

type Props = {|
  task: TaskType,
  index: number,
  isSelected: boolean,
  isGhosting: boolean,
  selectionCount: number,
  toggleSelection: (taskId: Id) => void,
  toggleSelectionInGroup: (taskId: Id) => void,
  multiSelectTo: (taskId: Id) => void,
|};

type GetBackgroundColorArgs = {|
  isSelected: boolean,
  isDragging: boolean,
  isGhosting: boolean,
|};

const getBackgroundColor = ({
  isSelected,
  isGhosting,
}: GetBackgroundColorArgs): string => {
  if (isGhosting) {
    return colors.N10;
  }

  if (isSelected) {
    return colors.B50;
  }

  return colors.N10;
};

const getColor = ({ isSelected, isGhosting }): string => {
  if (isGhosting) {
    return 'darkgrey';
  }
  if (isSelected) {
    return colors.B200;
  }
  return colors.N900;
};

const Container = styled.div`
  background-color: ${(props) => getBackgroundColor(props)};
  color: ${(props) => getColor(props)};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  font-size: 18px;
  border: 3px solid ${colors.N90};
  ${(props) =>
    props.isDragging ? `box-shadow: 2px 2px 1px ${colors.N90};` : ''} ${(
    props,
  ) =>
    props.isGhosting
      ? 'opacity: 0.8;'
      : ''}

  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:focus {
    outline: none;
    border-color: ${colors.G200};
  }
`;
/* stylelint-disable block-no-empty */
const Content = styled.div``;
/* stylelint-enable */
const size: number = 30;

const SelectionCount = styled.div`
  right: -${grid}px;
  top: -${grid}px;
  color: ${colors.N0};
  background: ${colors.N200};
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};

export default class Task extends Component<Props> {
  onKeyDown = (
    event: KeyboardEvent,
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    this.performAction(event);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    this.performAction(event);
  };

  onTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    this.props.toggleSelectionInGroup(this.props.task.id);
  };

  // Determines if the platform specific toggle selection in group key was used
  wasToggleInSelectionGroupKeyUsed = (event: MouseEvent | KeyboardEvent) => {
    const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  // Determines if the multiSelect key was used
  wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) => event.shiftKey;

  performAction = (event: MouseEvent | KeyboardEvent) => {
    const {
      task,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo,
    } = this.props;

    if (this.wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }

    if (this.wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }

    toggleSelection(task.id);
  };

  render() {
    const task: TaskType = this.props.task;
    const index: number = this.props.index;
    const isSelected: boolean = this.props.isSelected;
    const selectionCount: number = this.props.selectionCount;
    const isGhosting: boolean = this.props.isGhosting;
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
          const shouldShowSelection: boolean =
            snapshot.isDragging && selectionCount > 1;

          return (
            <Container
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={this.onClick}
              onTouchEnd={this.onTouchEnd}
              onKeyDown={(event: KeyboardEvent) =>
                this.onKeyDown(event, provided, snapshot)
              }
              isDragging={snapshot.isDragging}
              isSelected={isSelected}
              isGhosting={isGhosting}
            >
              <Content>{task.content}</Content>
              {shouldShowSelection ? (
                <SelectionCount>{selectionCount}</SelectionCount>
              ) : null}
            </Container>
          );
        }}
      </Draggable>
    );
  }
}
