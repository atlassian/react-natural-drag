// @flow
import * as React from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import type { Task } from '../types';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '../../../src';
import { grid } from '../constants';
import reorder, { moveBetween } from '../reorder';

let uniqueId = 0;
function getTasks(count: number): Task[] {
  return Array.from({ length: count }, (): Task => {
    const id: string = `${uniqueId++}`;

    return {
      id,
      content: `task: ${id}`,
    };
  });
}

const Item = styled.div`
  padding: ${grid}px;
  border: 1px solid ${colors.N30};
  background-color: ${(props) => (props.isDragging ? colors.G100 : colors.N30)};
  margin-top: ${grid}px;
  margin-left: ${grid}px;
  margin-right: ${grid}px;
`;

function renderTasks(
  tasks: Task[],
  options?: { isDragEnabled: boolean } = { isDragEnabled: true },
) {
  return tasks.map((task: Task, index: number) => {
    return (
      <Draggable
        draggableId={task.id}
        index={index}
        key={task.id}
        isDragDisabled={!options.isDragEnabled}
      >
        {(provided, snapshot) => (
          <Item
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
            ref={provided.innerRef}
          >
            Task id: {task.id}
          </Item>
        )}
      </Draggable>
    );
  });
}

const App = styled.div`
  display: flex;
  /* not going to force them to grow to the same size when the drag starts */
  align-items: start;
  user-select: none;
`;

const List = styled.div`
  border: 1px solid ${colors.G200};
  margin: ${grid}px;
  text-align: center;
  padding-bottom: ${grid}px;
`;

const Bin = styled(List)`
  border-color: ${colors.R200};
`;

const Tasks = styled(List)``;

const ListTitle = styled.h3`
  padding: ${grid}px;
  width: 250px;
`;

export default function AddingThings() {
  const [isShowingBin, setIsShowingBin] = useState(false);
  const [tasks, setTasks] = useState(() => getTasks(10));
  const [trash, setTrash] = useState(() => getTasks(2));

  function onBeforeCapture() {
    setIsShowingBin(true);
  }

  function onDragEnd(result: DropResult) {
    setIsShowingBin(false);
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'tasks') {
        setTasks(reorder(tasks, source.index, destination.index));
      }
      // In our current UI it won't be possible to reorder trash
      return;
    }

    const { list1, list2 } = moveBetween({
      list1: {
        id: 'tasks',
        values: tasks,
      },
      list2: {
        id: 'trash',
        values: trash,
      },
      source,
      destination,
    });

    setTasks(list1.values);
    setTrash(list2.values);
  }

  return (
    <DragDropContext onBeforeCapture={onBeforeCapture} onDragEnd={onDragEnd}>
      <App>
        <Tasks>
          <ListTitle>
            Tasks{' '}
            <span role="img" aria-label="book">
              📘
            </span>
          </ListTitle>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {renderTasks(tasks)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Tasks>
        {isShowingBin ? (
          <Bin>
            <ListTitle>
              Trash{' '}
              <span role="img" aria-label="trash">
                🗑
              </span>
            </ListTitle>
            <Droppable droppableId="bin">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {renderTasks(trash, { isDragEnabled: false })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Bin>
        ) : null}
      </App>
    </DragDropContext>
  );
}
