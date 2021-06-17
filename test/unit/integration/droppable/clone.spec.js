// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { invariant } from '../../../../src/invariant';
import { type DraggableStateSnapshot } from '../../../../src';
import { simpleLift, keyboard } from '../util/controls';
import expandedMouse from '../util/expanded-mouse';
import getBodyElement from '../../../../src/view/get-body-element';
import {
  withPoorDimensionMocks,
  renderItemAndSpy,
  isClone,
  getCallsFor,
  getLast,
  type Call,
  isDragging,
  isDropAnimating,
} from '../util/helpers';
import App, { type RenderItem } from '../util/app';
import { withError } from '../../../util/console';

it('should no longer render the original draggable while dragging', () => {
  const { getByTestId } = render(<App useClone />);

  // doing this in a loop to ensure that multiple reorders is fine
  Array.from({ length: 4 }).forEach(() => {
    const beforeLift = getByTestId('0');
    simpleLift(keyboard, beforeLift);
    expect(isClone(beforeLift)).toBe(false);

    // after lift there is still only one item - but it is different
    const clone = getByTestId('0');
    expect(clone).not.toBe(beforeLift);
    expect(isDragging(clone)).toBe(true);
    expect(isClone(clone)).toBe(true);

    keyboard.drop(clone);

    const finished = getByTestId('0');
    expect(finished).not.toBe(clone);
    expect(isClone(finished)).toBe(false);
    expect(isDragging(finished)).toBe(false);
  });
});

it('should render a dragging item into the container', () => {
  const body = getBodyElement();
  // default location is the body
  {
    const { unmount, getByTestId } = render(<App useClone />);
    simpleLift(keyboard, getByTestId('0'));
    expect(getByTestId('0').parentElement).toBe(body);
    unmount();
  }
  {
    const element: HTMLElement = document.createElement('div');
    body.appendChild(element);
    const { unmount, getByTestId } = render(
      <App useClone getContainerForClone={() => element} />,
    );
    simpleLift(keyboard, getByTestId('0'));
    expect(getByTestId('0').parentElement).toBe(element);
    unmount();
  }
});

it('should give the clone the starting location', () => {
  const spy = jest.fn();
  const renderItem: RenderItem = renderItemAndSpy(spy);
  const { getByTestId } = render(<App renderItem={renderItem} useClone />);

  simpleLift(keyboard, getByTestId('1'));

  const last: ?Call = getLast(getCallsFor('1', spy));
  invariant(last);
  const expected: DraggableStateSnapshot = {
    isClone: true,
    isDragging: true,
    isDropAnimating: false,
    dropAnimation: null,
    combineTargetFor: null,
    combineWith: null,
    draggingOver: 'droppable',
    mode: 'SNAP',
  };
  expect(last[1]).toEqual(expected);
});

// this test is indirectly validating that a clone does not talk the registry or marshal
it('should allow reordering other items when dropping', () => {
  withPoorDimensionMocks((preset) => {
    const { getByTestId } = render(<App useClone />);
    const box0 = preset.inHome1.client.borderBox;
    const box1 = preset.inHome2.client.borderBox;

    expandedMouse.powerLift(getByTestId('0'), box0.center);

    const clone: HTMLElement = getByTestId('0');
    expect(isClone(clone)).toBe(true);
    expect(isDragging(clone)).toBe(true);

    // move item 0 to index 1
    expandedMouse.move(clone, box1.center);

    // drop started, but still occurring
    expandedMouse.startDrop(clone);
    expect(isDropAnimating(clone)).toBe(true);

    // starting a new drag with item 1 (which is in index 0 visually now)
    // using box0.center as the lifting point
    // we are relying on a sync render from a dispatched action
    // act(() => {}); is joining the two into one update which is
    // causing unexpected mounting behaviour
    withError(() => {
      expandedMouse.rawPowerLift(getByTestId('1'), box0.center);
    });

    expect(isDragging(getByTestId('1'))).toBe(true);
    expect(isDragging(getByTestId('0'))).toBe(false);
  });
});
