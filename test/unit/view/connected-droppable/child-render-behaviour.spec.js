// @flow
import * as React from 'react';
import { Component } from 'react';
import { mount } from 'enzyme';
import type { Provided } from '../../../../src/view/droppable/droppable-types';
import Droppable from '../../../../src/view/droppable/connected-droppable';
import forceUpdate from '../../../util/force-update';
import { DragDropContext } from '../../../../src';

class Person extends Component<{ name: string, provided: Provided }> {
  render() {
    const { provided, name } = this.props;
    return (
      <div ref={(ref) => provided.innerRef(ref)} {...provided.droppableProps}>
        hello {name}
      </div>
    );
  }
}

class App extends Component<{ currentUser: string }> {
  render() {
    return (
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="drop-1">
          {(provided: Provided) => (
            <Person name={this.props.currentUser} provided={provided} />
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

beforeEach(() => {
  jest.spyOn(Person.prototype, 'render');
});

afterEach(() => {
  Person.prototype.render.mockRestore();
});

it('should render the child function when the parent renders', () => {
  const wrapper = mount(<App currentUser="Jake" />);

  expect(Person.prototype.render).toHaveBeenCalledTimes(1);
  expect(wrapper.find(Person).props().name).toBe('Jake');

  wrapper.unmount();
});

it('should render the child function when the parent re-renders', () => {
  const wrapper = mount(<App currentUser="Jake" />);

  forceUpdate(wrapper);

  expect(Person.prototype.render).toHaveBeenCalledTimes(2);
  expect(wrapper.find(Person).props().name).toBe('Jake');

  wrapper.unmount();
});

it('should render the child function when the parents props changes that cause a re-render', () => {
  const wrapper = mount(<App currentUser="Jake" />);

  wrapper.setProps({
    currentUser: 'Finn',
  });

  expect(Person.prototype.render).toHaveBeenCalledTimes(2);
  expect(wrapper.find(Person).props().name).toBe('Finn');

  wrapper.unmount();
});
