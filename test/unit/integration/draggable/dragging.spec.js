// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import App, { type RenderItem } from '../util/app';
import { type DraggableStateSnapshot } from '../../../../src';
import { simpleLift, mouse, keyboard } from '../util/controls';
import expandedMouse from '../util/expanded-mouse';
import {
  isDragging,
  renderItemAndSpy,
  withPoorDimensionMocks,
  getSnapshotsFor,
  getLast,
} from '../util/helpers';
import { transitions, combine } from '../../../../src/animation';
import { zIndexOptions } from '../../../../src/view/draggable/get-style';

it('should move to a provided offset', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(mouse, handle);
  expect(isDragging(handle)).toBe(true);

  // no transform as we are at {x: 0, y: 0}
  expect(handle.style.transform).toBe('');
  expect(handle.style.transition).toBe(transitions.fluid);
  expect(handle.style.zIndex).toBe(`${zIndexOptions.dragging}`);

  mouse.move(handle);

  expect(handle.style.transform).toBe(`translate(0px, 1px)`);
  expect(handle.style.transition).toBe(transitions.fluid);
  expect(handle.style.zIndex).toBe(`${zIndexOptions.dragging}`);
});

it('should pass on the snapshot', () => {
  const spy = jest.fn();
  const renderItem: RenderItem = renderItemAndSpy(spy);

  const { getByText } = render(<App renderItem={renderItem} />);
  const handle: HTMLElement = getByText('item: 0');
  expect(getSnapshotsFor('0', spy)).toHaveLength(1);

  simpleLift(mouse, handle);
  expect(isDragging(handle)).toBe(true);
  expect(getSnapshotsFor('0', spy)).toHaveLength(2);

  {
    const snapshot = getLast(getSnapshotsFor('0', spy));
    const lift: DraggableStateSnapshot = {
      isDragging: true,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      draggingOver: 'droppable',
      combineWith: null,
      combineTargetFor: null,
      mode: 'FLUID',
    };
    expect(snapshot).toEqual(lift);
  }

  mouse.move(handle);

  {
    const snapshot = getLast(getSnapshotsFor('0', spy));
    const move: DraggableStateSnapshot = {
      isDragging: true,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      // cleared because we are not setting any dimensions and we are
      // no longer over anything
      draggingOver: null,
      combineWith: null,
      combineTargetFor: null,
      mode: 'FLUID',
    };
    expect(snapshot).toEqual(move);
  }
});

it('should animate movements when in snap mode', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  expect(isDragging(handle)).toBe(true);
  expect(handle.style.transition).toBe(transitions.snap);
});

it('should update the snapshot and opacity when combining with another item', () => {
  withPoorDimensionMocks((preset) => {
    const spy = jest.fn();
    const renderItem: RenderItem = renderItemAndSpy(spy);
    const box1 = preset.inHome1.client.borderBox;
    const box2 = preset.inHome2.client.borderBox;

    const { getByText } = render(
      <App renderItem={renderItem} isCombineEnabled />,
    );
    const handle: HTMLElement = getByText('item: 0');

    expandedMouse.powerLift(handle, box1.center);

    // this will combine with the second item
    expandedMouse.move(handle, box2.center);

    const snapshot = getLast(getSnapshotsFor('0', spy));

    const expected: DraggableStateSnapshot = {
      isDragging: true,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      draggingOver: 'droppable',
      // combining with #1
      combineWith: '1',
      combineTargetFor: null,
      mode: 'FLUID',
    };
    expect(snapshot).toEqual(expected);
    expect(handle.style.opacity).toBe(`${combine.opacity.combining}`);
  });
});
