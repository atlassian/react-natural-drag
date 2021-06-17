// @flow
import { render } from '@testing-library/react';
import * as React from 'react';
import type { DraggableStateSnapshot } from '../../../../src';
import App, { type RenderItem } from '../util/app';
import expandedMouse from '../util/expanded-mouse';
import {
  isDragging,
  renderItemAndSpy,
  withPoorDimensionMocks,
  isCombining,
  isCombineTarget,
  getLast,
  getSnapshotsFor,
} from '../util/helpers';

it('should update the snapshot of an item being combined with', () => {
  withPoorDimensionMocks((preset) => {
    const spy = jest.fn();
    const renderItem: RenderItem = renderItemAndSpy(spy);
    const { getByText } = render(
      <App renderItem={renderItem} isCombineEnabled />,
    );
    const critical: HTMLElement = getByText('item: 0');
    const after: HTMLElement = getByText('item: 1');
    const criticalBox = preset.inHome1.client.borderBox;
    const afterBox = preset.inHome2.client.borderBox;

    expandedMouse.powerLift(critical, criticalBox.center);
    expect(isDragging(critical)).toBe(true);

    // will now be combining
    expandedMouse.move(critical, afterBox.center);

    expect(isCombining(critical)).toBe(true);
    expect(isCombineTarget(after)).toBe(true);

    const snapshot = getLast(getSnapshotsFor('1', spy));
    const expected: DraggableStateSnapshot = {
      isDragging: false,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      draggingOver: null,
      combineWith: null,
      combineTargetFor: '0',
      mode: null,
    };
    expect(snapshot).toEqual(expected);
  });
});
