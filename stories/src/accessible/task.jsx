// @flow
import * as React from 'react';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import memoizeOne from 'memoize-one';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { invariant } from '../../../src/invariant';
import { Draggable } from '../../../src';
import type { DraggableProvided, DraggableStateSnapshot } from '../../../src';
import type { Task as TaskType } from '../types';
import { grid, borderRadius } from '../constants';
import BlurContext from './blur-context';

type Props = {|
  task: TaskType,
  index: number,
|};

const Container = styled.div`
  border-bottom: 1px solid #ccc;
  background: ${colors.N0};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  font-size: 18px;
  filter: blur(${(props) => props.blur}px);
  ${({ isDragging }) =>
    isDragging ? 'box-shadow: 1px 1px 1px grey; background: lightblue' : ''};
`;

const getPortal = memoizeOne((): HTMLElement => {
  invariant(document);
  const body: ?HTMLBodyElement = document.body;
  invariant(body);
  const el: HTMLElement = document.createElement('div');
  el.className = 'rbd-portal';
  body.appendChild(el);
  return el;
});

export default class Task extends Component<Props> {
  render() {
    const task: TaskType = this.props.task;
    const index: number = this.props.index;

    return (
      <BlurContext.Consumer>
        {(blur: number) => (
          <Draggable draggableId={task.id} index={index}>
            {(
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
            ) => {
              const child: React.Node = (
                <Container
                  ref={provided.innerRef}
                  isDragging={snapshot.isDragging}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  blur={blur}
                >
                  {this.props.task.content}
                </Container>
              );

              if (!snapshot.isDragging) {
                return child;
              }

              return ReactDOM.createPortal(child, getPortal());
            }}
          </Draggable>
        )}
      </BlurContext.Consumer>
    );
  }
}
