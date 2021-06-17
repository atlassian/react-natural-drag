// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import memoizeOne from 'memoize-one';
import { colors } from '@atlaskit/theme';
import { Droppable } from '../../../src';
import { grid, borderRadius } from '../constants';
import Task from './task';
import type { DroppableProvided, DroppableStateSnapshot } from '../../../src';
import type { Column as ColumnType } from './types';
import type { Task as TaskType, Id } from '../types';

type Props = {|
  column: ColumnType,
  tasks: TaskType[],
  selectedTaskIds: Id[],
  draggingTaskId: ?Id,
  toggleSelection: (taskId: Id) => void,
  toggleSelectionInGroup: (taskId: Id) => void,
  multiSelectTo: (taskId: Id) => void,
|};

// $ExpectError - not sure why
const Container = styled.div`
  width: 300px;
  margin: ${grid}px;
  border-radius: ${borderRadius}px;
  border: 1px solid ${colors.N100};
  background-color: ${colors.N50};

  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: ${grid}px;
`;

const TaskList = styled.div`
  padding: ${grid}px;
  min-height: 200px;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${(props) =>
    props.isDraggingOver ? `background-color: ${colors.N200}` : ''};
`;

type TaskIdMap = {
  [taskId: Id]: true,
};

const getSelectedMap = memoizeOne((selectedTaskIds: Id[]) =>
  selectedTaskIds.reduce((previous: TaskIdMap, current: Id): TaskIdMap => {
    previous[current] = true;
    return previous;
  }, {}),
);

export default class Column extends Component<Props> {
  render() {
    const column: ColumnType = this.props.column;
    const tasks: TaskType[] = this.props.tasks;
    const selectedTaskIds: Id[] = this.props.selectedTaskIds;
    const draggingTaskId: ?Id = this.props.draggingTaskId;
    return (
      <Container>
        <Title>{column.title}</Title>
        <Droppable droppableId={column.id}>
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <TaskList
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
              {...provided.droppableProps}
            >
              {tasks.map((task: TaskType, index: number) => {
                const isSelected: boolean = Boolean(
                  getSelectedMap(selectedTaskIds)[task.id],
                );
                const isGhosting: boolean =
                  isSelected &&
                  Boolean(draggingTaskId) &&
                  draggingTaskId !== task.id;
                return (
                  <Task
                    task={task}
                    index={index}
                    key={task.id}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    selectionCount={selectedTaskIds.length}
                    toggleSelection={this.props.toggleSelection}
                    toggleSelectionInGroup={this.props.toggleSelectionInGroup}
                    multiSelectTo={this.props.multiSelectTo}
                  />
                );
              })}
              {provided.placeholder}
            </TaskList>
          )}
        </Droppable>
      </Container>
    );
  }
}
