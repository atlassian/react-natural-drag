// @flow
import type { Column, ColumnMap, Entities } from './types';
import type { Id } from '../types';
import { invariant } from '../../../src/invariant';
import type { DraggableLocation } from '../../../src/types';
import reorder from '../reorder';

type Args = {|
  entities: Entities,
  selectedTaskIds: Id[],
  source: DraggableLocation,
  destination: DraggableLocation,
|};

export type Result = {|
  entities: Entities,
  // a drop operations can change the order of the selected task array
  selectedTaskIds: Id[],
|};

const withNewTaskIds = (column: Column, taskIds: Id[]): Column => ({
  id: column.id,
  title: column.title,
  taskIds,
});

const reorderSingleDrag = ({
  entities,
  selectedTaskIds,
  source,
  destination,
}: Args): Result => {
  // moving in the same list
  if (source.droppableId === destination.droppableId) {
    const column: Column = entities.columns[source.droppableId];
    const reordered: Id[] = reorder(
      column.taskIds,
      source.index,
      destination.index,
    );

    const updated: Entities = {
      ...entities,
      columns: {
        ...entities.columns,
        [column.id]: withNewTaskIds(column, reordered),
      },
    };

    return {
      entities: updated,
      selectedTaskIds,
    };
  }

  // moving to a new list
  const home: Column = entities.columns[source.droppableId];
  const foreign: Column = entities.columns[destination.droppableId];

  // the id of the task to be moved
  const taskId: Id = home.taskIds[source.index];

  // remove from home column
  const newHomeTaskIds: Id[] = [...home.taskIds];
  newHomeTaskIds.splice(source.index, 1);

  // add to foreign column
  const newForeignTaskIds: Id[] = [...foreign.taskIds];
  newForeignTaskIds.splice(destination.index, 0, taskId);

  const updated: Entities = {
    ...entities,
    columns: {
      ...entities.columns,
      [home.id]: withNewTaskIds(home, newHomeTaskIds),
      [foreign.id]: withNewTaskIds(foreign, newForeignTaskIds),
    },
  };

  return {
    entities: updated,
    selectedTaskIds,
  };
};

type TaskId = Id;

export const getHomeColumn = (entities: Entities, taskId: TaskId): Column => {
  const columnId: ?Id = entities.columnOrder.find((id: Id) => {
    const column: Column = entities.columns[id];
    return column.taskIds.includes(taskId);
  });

  invariant(columnId, 'Count not find column for task');

  return entities.columns[columnId];
};

const reorderMultiDrag = ({
  entities,
  selectedTaskIds,
  source,
  destination,
}: Args): Result => {
  const start: Column = entities.columns[source.droppableId];
  const dragged: TaskId = start.taskIds[source.index];

  const insertAtIndex: number = (() => {
    const destinationIndexOffset: number = selectedTaskIds.reduce(
      (previous: number, current: TaskId): number => {
        if (current === dragged) {
          return previous;
        }

        const final: Column = entities.columns[destination.droppableId];
        const column: Column = getHomeColumn(entities, current);

        if (column !== final) {
          return previous;
        }

        const index: number = column.taskIds.indexOf(current);

        if (index >= destination.index) {
          return previous;
        }

        // the selected item is before the destination index
        // we need to account for this when inserting into the new location
        return previous + 1;
      },
      0,
    );

    const result: number = destination.index - destinationIndexOffset;
    return result;
  })();

  // doing the ordering now as we are required to look up columns
  // and know original ordering
  const orderedSelectedTaskIds: TaskId[] = [...selectedTaskIds];
  orderedSelectedTaskIds.sort((a: TaskId, b: TaskId): number => {
    // moving the dragged item to the top of the list
    if (a === dragged) {
      return -1;
    }
    if (b === dragged) {
      return 1;
    }

    // sorting by their natural indexes
    const columnForA: Column = getHomeColumn(entities, a);
    const indexOfA: number = columnForA.taskIds.indexOf(a);
    const columnForB: Column = getHomeColumn(entities, b);
    const indexOfB: number = columnForB.taskIds.indexOf(b);

    if (indexOfA !== indexOfB) {
      return indexOfA - indexOfB;
    }

    // sorting by their order in the selectedTaskIds list
    return -1;
  });

  // we need to remove all of the selected tasks from their columns
  const withRemovedTasks: ColumnMap = entities.columnOrder.reduce(
    (previous: ColumnMap, columnId: Id): ColumnMap => {
      const column: Column = entities.columns[columnId];

      // remove the id's of the items that are selected
      const remainingTaskIds: TaskId[] = column.taskIds.filter(
        (id: TaskId): boolean => !selectedTaskIds.includes(id),
      );

      previous[column.id] = withNewTaskIds(column, remainingTaskIds);
      return previous;
    },
    entities.columns,
  );

  const final: Column = withRemovedTasks[destination.droppableId];
  const withInserted: TaskId[] = (() => {
    const base: TaskId[] = [...final.taskIds];
    base.splice(insertAtIndex, 0, ...orderedSelectedTaskIds);
    return base;
  })();

  // insert all selected tasks into final column
  const withAddedTasks: ColumnMap = {
    ...withRemovedTasks,
    [final.id]: withNewTaskIds(final, withInserted),
  };

  const updated: Entities = {
    ...entities,
    columns: withAddedTasks,
  };

  return {
    entities: updated,
    selectedTaskIds: orderedSelectedTaskIds,
  };
};

export const multiDragAwareReorder = (args: Args): Result => {
  if (args.selectedTaskIds.length > 1) {
    return reorderMultiDrag(args);
  }
  return reorderSingleDrag(args);
};

export const multiSelectTo = (
  entities: Entities,
  selectedTaskIds: Id[],
  newTaskId: TaskId,
): ?(Id[]) => {
  // Nothing already selected
  if (!selectedTaskIds.length) {
    return [newTaskId];
  }

  const columnOfNew: Column = getHomeColumn(entities, newTaskId);
  const indexOfNew: number = columnOfNew.taskIds.indexOf(newTaskId);

  const lastSelected: Id = selectedTaskIds[selectedTaskIds.length - 1];
  const columnOfLast: Column = getHomeColumn(entities, lastSelected);
  const indexOfLast: number = columnOfLast.taskIds.indexOf(lastSelected);

  // multi selecting to another column
  // select everything up to the index of the current item
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.taskIds.slice(0, indexOfNew + 1);
  }

  // multi selecting in the same column
  // need to select everything between the last index and the current index inclusive

  // nothing to do here
  if (indexOfNew === indexOfLast) {
    return null;
  }

  const isSelectingForwards: boolean = indexOfNew > indexOfLast;
  const start: number = isSelectingForwards ? indexOfLast : indexOfNew;
  const end: number = isSelectingForwards ? indexOfNew : indexOfLast;

  const inBetween: Id[] = columnOfNew.taskIds.slice(start, end + 1);

  // everything inbetween needs to have it's selection toggled.
  // with the exception of the start and end values which will always be selected

  const toAdd: Id[] = inBetween.filter((taskId: Id): boolean => {
    // if already selected: then no need to select it again
    if (selectedTaskIds.includes(taskId)) {
      return false;
    }
    return true;
  });

  const sorted: Id[] = isSelectingForwards ? toAdd : [...toAdd].reverse();
  const combined: Id[] = [...selectedTaskIds, ...sorted];

  return combined;
};
