// @flow
import * as React from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import Placeholder from './util/placeholder-with-class';
import type { PlaceholderStyle } from '../../../../src/view/placeholder/placeholder-types';
import { expectIsEmpty, expectIsFull } from './util/expect';
import { placeholder } from './util/data';
import getPlaceholderStyle from './util/get-placeholder-style';
import * as attributes from '../../../../src/view/data-attributes';

jest.useFakeTimers();
const contextId: string = 'hello-there';

let spy;

beforeEach(() => {
  spy = jest.spyOn(React, 'createElement');
});

afterEach(() => {
  spy.mockRestore();
});

const getCreatePlaceholderCalls = () => {
  return spy.mock.calls.filter((call) => {
    return call[1] && call[1][attributes.placeholder.contextId] === contextId;
  });
};

it('should animate a mount', () => {
  const wrapper: ReactWrapper<*> = mount(
    <Placeholder
      contextId={contextId}
      animate="open"
      placeholder={placeholder}
      onClose={jest.fn()}
      onTransitionEnd={jest.fn()}
    />,
  );

  expect(getCreatePlaceholderCalls().length).toBe(1);

  // first call had an empty size
  const onMount: PlaceholderStyle = getPlaceholderStyle(wrapper);
  expectIsEmpty(onMount);

  // Will trigger a .setState
  act(() => {
    jest.runOnlyPendingTimers();
  });

  // tell enzyme that something has changed
  wrapper.update();

  const postMount: PlaceholderStyle = getPlaceholderStyle(wrapper);
  expectIsFull(postMount);
});

it('should not animate a mount if interrupted', () => {
  const wrapper: ReactWrapper<*> = mount(
    <Placeholder
      animate="open"
      contextId={contextId}
      placeholder={placeholder}
      onClose={jest.fn()}
      onTransitionEnd={jest.fn()}
    />,
  );
  const onMount: PlaceholderStyle = getPlaceholderStyle(wrapper);
  expectIsEmpty(onMount);

  expect(getCreatePlaceholderCalls()).toHaveLength(1);

  // interrupting animation
  wrapper.setProps({
    animate: 'none',
  });

  // render 1: normal
  // render 2: useEffect calling setState
  // render 3: result of setState
  expect(getCreatePlaceholderCalls()).toHaveLength(3);

  // no timers are run
  // let enzyme know that the react tree has changed due to the set state
  wrapper.update();

  const postMount: PlaceholderStyle = getPlaceholderStyle(wrapper);
  expectIsFull(postMount);

  // validation - no further updates
  spy.mockClear();
  jest.runOnlyPendingTimers();
  wrapper.update();
  expectIsFull(getPlaceholderStyle(wrapper));
  expect(getCreatePlaceholderCalls()).toHaveLength(0);
});

it('should not animate in if unmounted', () => {
  const error = jest.spyOn(console, 'error');

  const wrapper: ReactWrapper<*> = mount(
    <Placeholder
      animate="open"
      contextId={contextId}
      placeholder={placeholder}
      onClose={jest.fn()}
      onTransitionEnd={jest.fn()}
    />,
  );
  expectIsEmpty(getPlaceholderStyle(wrapper));

  wrapper.unmount();
  jest.runOnlyPendingTimers();

  // an internal setState would be triggered the timer was
  // not cleared when unmounting
  expect(error).not.toHaveBeenCalled();
  error.mockRestore();
});
