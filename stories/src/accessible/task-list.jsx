// @flow
import * as React from 'react';
import { Component } from 'react';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import { Droppable } from '../../../src';
import Task from './task';
import type { DroppableProvided } from '../../../src';
import type { Task as TaskType } from '../types';
import { grid, borderRadius } from '../constants';
import BlurContext from './blur-context';

type Props = {|
  tasks: TaskType[],
  title: string,
|};

const Container = styled.div`
  width: 300px;
  background-color: ${colors.N100};
  border-radius: ${borderRadius}px;
  filter: blur(${(props) => props.blur}px);
`;

const Title = styled.h3`
  font-weight: bold;
  padding: ${grid}px;
`;

const List = styled.div`
  padding: ${grid}px;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
`;

export default class TaskList extends Component<Props> {
  render() {
    return (
      <Droppable droppableId="list">
        {(provided: DroppableProvided) => (
          <BlurContext.Consumer>
            {(blur: number) => (
              <Container
                ref={provided.innerRef}
                {...provided.droppableProps}
                blur={blur}
              >
                <Title>{this.props.title}</Title>
                <List>
                  {this.props.tasks.map((task: TaskType, index: number) => (
                    <Task key={task.id} task={task} index={index} />
                  ))}
                </List>
                {provided.placeholder}
              </Container>
            )}
          </BlurContext.Consumer>
        )}
      </Droppable>
    );
  }
}
