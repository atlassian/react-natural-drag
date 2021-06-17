// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import TaskList from './task-list';
import initial from './data';
import reorder from '../reorder';
import { grid } from '../constants';
import { DragDropContext } from '../../../src';
import BlurContext from './blur-context';
import type {
  Announce,
  DragStart,
  DragUpdate,
  DropResult,
  DraggableLocation,
  ResponderProvided,
} from '../../../src';
import type { Task } from '../types';

type State = {|
  tasks: Task[],
  blur: number,
|};

const Container = styled.div`
  padding-top: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BlurControls = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
  margin-top: 20vh;
`;

const BlurTitle = styled.h4`
  margin: 0;
`;

const Button = styled.button`
  height: ${grid * 5}px;
  width: ${grid * 5}px;
  font-size: 20px;
  justify-content: center;
  margin: 0 ${grid * 2}px;
  cursor: pointer;
`;

export default class TaskApp extends Component<*, State> {
  state: State = {
    tasks: initial,
    blur: 0,
  };

  // in?
  onDragStart = (start: DragStart, provided: ResponderProvided): void =>
    provided.announce(`
    You have lifted a task.
    It is in position ${start.source.index + 1} of ${
      this.state.tasks.length
    } in the list.
    Use the arrow keys to move, space bar to drop, and escape to cancel.
  `);

  onDragUpdate = (update: DragUpdate, provided: ResponderProvided): void => {
    const announce: Announce = provided.announce;
    if (!update.destination) {
      announce('You are currently not dragging over any droppable area');
      return;
    }
    announce(
      `You have moved the task to position ${update.destination.index + 1}`,
    );
  };

  onDragEnd = (result: DropResult, provided: ResponderProvided): void => {
    const announce: Announce = provided.announce;
    // TODO: not being called on cancel!!!
    if (result.reason === 'CANCEL') {
      announce(`
        Movement cancelled.
        The task has returned to its starting position of ${
          result.source.index + 1
        }
      `);
      return;
    }

    const destination: ?DraggableLocation = result.destination;

    if (!destination) {
      announce(`
        The task has been dropped while not over a location.
        The task has returned to its starting position of ${
          result.source.index + 1
        }
      `);
      return;
    }

    const tasks: Task[] = reorder(
      this.state.tasks,
      result.source.index,
      destination.index,
    );

    this.setState({
      tasks,
    });

    announce(`
      You have dropped the task.
      It has moved from position ${result.source.index + 1} to ${
      destination.index + 1
    }
    `);
  };

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Container>
          <BlurContext.Provider value={this.state.blur}>
            <TaskList title="Todo" tasks={this.state.tasks} />
          </BlurContext.Provider>
          <BlurControls>
            <Button
              aria-label="remove blur"
              onClick={() =>
                this.setState({ blur: Math.max(0, this.state.blur - 1) })
              }
            >
              -
            </Button>
            <BlurTitle>Blur</BlurTitle>
            <Button
              aria-label="add blur"
              onClick={() =>
                this.setState({ blur: Math.min(this.state.blur + 1, 10) })
              }
            >
              +
            </Button>
          </BlurControls>
        </Container>
      </DragDropContext>
    );
  }
}
