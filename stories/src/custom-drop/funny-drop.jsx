// @flow
import * as React from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { grid } from '../constants';
import reorder from '../reorder';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DroppableProvided,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableStyle,
  type DropAnimation,
  type DropResult,
} from '../../../src';

type Task = {|
  id: string,
  content: string,
|};

type TaskItemProps = {|
  task: Task,
  index: number,
|};

const Canvas = styled.div`
  padding: ${grid}px;
  background: ${(props) => (props.isDragging ? colors.G50 : colors.B50)};
  margin-bottom: ${grid}px;
  border-radius: 3px;
`;

const getStyle = (
  style: ?DraggableStyle,
  snapshot: DraggableStateSnapshot,
): ?Object => {
  const dropping: ?DropAnimation = snapshot.dropAnimation;
  if (!dropping) {
    return style;
  }
  const { moveTo, curve, duration } = dropping;
  const translate = `translate(${moveTo.x}px, ${moveTo.y}px)`;
  const rotate = 'rotate(1turn)';
  return {
    ...style,
    transform: `${translate} ${rotate}`,
    // slowing down the drop
    transition: `all ${curve} ${duration + 1}s`,
  };
};

class TaskItem extends React.Component<TaskItemProps> {
  render() {
    const task: Task = this.props.task;
    return (
      <Draggable draggableId={task.id} index={this.props.index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
          <Canvas
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging && !snapshot.isDropAnimating}
            style={getStyle(provided.draggableProps.style, snapshot)}
          >
            {task.content}
          </Canvas>
        )}
      </Draggable>
    );
  }
}

const List = styled.div`
  font-size: 16px;
  line-height: 1.5;
  width: 200px;
  margin: ${grid}px;
`;
const initial: Task[] = Array.from({ length: 10 }, (v, k): Task => ({
  id: `task-${k}`,
  content: `Task ${k}`,
}));

type State = {|
  tasks: Task[],
|};
export default class App extends React.Component<*, State> {
  state: State = {
    tasks: initial,
  };

  onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    this.setState({
      tasks: reorder(
        this.state.tasks,
        result.source.index,
        result.destination.index,
      ),
    });
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided: DroppableProvided) => (
            <List ref={provided.innerRef} {...provided.droppableProps}>
              {this.state.tasks.map((task: Task, index: number) => (
                <TaskItem task={task} index={index} key={task.id} />
              ))}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
