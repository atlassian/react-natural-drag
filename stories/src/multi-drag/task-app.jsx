// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { DragDropContext } from '../../../src';
import initial from './data';
import Column from './column';
import type { Result as ReorderResult } from './utils';
import { mutliDragAwareReorder, multiSelectTo as multiSelect } from './utils';
import type { DragStart, DropResult, DraggableLocation } from '../../../src';
import type { Task, Id } from '../types';
import type { Entities } from './types';

const Container = styled.div`
  display: flex;
  user-select: none;
`;

type State = {|
  entities: Entities,
  selectedTaskIds: Id[],
  // sad times
  draggingTaskId: ?Id,
|};

const getTasks = (entities: Entities, columnId: Id): Task[] =>
  entities.columns[columnId].taskIds.map(
    (taskId: Id): Task => entities.tasks[taskId],
  );
export default class TaskApp extends Component<*, State> {
  state: State = {
    entities: initial,
    selectedTaskIds: [],
    draggingTaskId: null,
  };

  componentDidMount() {
    window.addEventListener('click', this.onWindowClick);
    window.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('touchend', this.onWindowTouchEnd);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
    window.removeEventListener('keydown', this.onWindowKeyDown);
    window.removeEventListener('touchend', this.onWindowTouchEnd);
  }

  onDragStart = (start: DragStart) => {
    const id: string = start.draggableId;
    const selected: ?Id = this.state.selectedTaskIds.find(
      (taskId: Id): boolean => taskId === id,
    );

    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      this.unselectAll();
    }
    this.setState({
      draggingTaskId: start.draggableId,
    });
  };

  onDragEnd = (result: DropResult) => {
    const destination: ?DraggableLocation = result.destination;
    const source: DraggableLocation = result.source;

    // nothing to do
    if (!destination || result.reason === 'CANCEL') {
      this.setState({
        draggingTaskId: null,
      });
      return;
    }

    const processed: ReorderResult = mutliDragAwareReorder({
      entities: this.state.entities,
      selectedTaskIds: this.state.selectedTaskIds,
      source,
      destination,
    });

    this.setState({
      ...processed,
      draggingTaskId: null,
    });
  };

  onWindowKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Escape') {
      this.unselectAll();
    }
  };

  onWindowClick = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    this.unselectAll();
  };

  onWindowTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    this.unselectAll();
  };

  toggleSelection = (taskId: Id) => {
    const selectedTaskIds: Id[] = this.state.selectedTaskIds;
    const wasSelected: boolean = selectedTaskIds.includes(taskId);

    const newTaskIds: Id[] = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [taskId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (selectedTaskIds.length > 1) {
        return [taskId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    this.setState({
      selectedTaskIds: newTaskIds,
    });
  };

  toggleSelectionInGroup = (taskId: Id) => {
    const selectedTaskIds: Id[] = this.state.selectedTaskIds;
    const index: number = selectedTaskIds.indexOf(taskId);

    // if not selected - add it to the selected items
    if (index === -1) {
      this.setState({
        selectedTaskIds: [...selectedTaskIds, taskId],
      });
      return;
    }

    // it was previously selected and now needs to be removed from the group
    const shallow: Id[] = [...selectedTaskIds];
    shallow.splice(index, 1);
    this.setState({
      selectedTaskIds: shallow,
    });
  };

  // This behaviour matches the MacOSX finder selection
  multiSelectTo = (newTaskId: Id) => {
    const updated: ?(Id[]) = multiSelect(
      this.state.entities,
      this.state.selectedTaskIds,
      newTaskId,
    );

    if (updated == null) {
      return;
    }

    this.setState({
      selectedTaskIds: updated,
    });
  };

  unselect = () => {
    this.unselectAll();
  };

  unselectAll = () => {
    this.setState({
      selectedTaskIds: [],
    });
  };

  render() {
    const entities: Entities = this.state.entities;
    const selected: Id[] = this.state.selectedTaskIds;
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      >
        <Container>
          {entities.columnOrder.map((columnId: Id) => (
            <Column
              column={entities.columns[columnId]}
              tasks={getTasks(entities, columnId)}
              selectedTaskIds={selected}
              key={columnId}
              draggingTaskId={this.state.draggingTaskId}
              toggleSelection={this.toggleSelection}
              toggleSelectionInGroup={this.toggleSelectionInGroup}
              multiSelectTo={this.multiSelectTo}
            />
          ))}
        </Container>
      </DragDropContext>
    );
  }
}
