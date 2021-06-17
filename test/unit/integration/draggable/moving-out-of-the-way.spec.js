// @flow
import { render } from '@testing-library/react';
import * as React from 'react';
import App from '../util/app';
import expandedMouse from '../util/expanded-mouse';
import {
  isDragging,
  renderItemAndSpy,
  withPoorDimensionMocks,
} from '../util/helpers';

it('should move out of the way when requested', () => {
  withPoorDimensionMocks((preset) => {
    const spy = jest.fn();
    const renderItem = renderItemAndSpy(spy);
    const { getByText } = render(<App renderItem={renderItem} />);
    const before: HTMLElement = getByText('item: 0');
    const critical: HTMLElement = getByText('item: 1');
    const after: HTMLElement = getByText('item: 2');
    const criticalBox = preset.inHome2.client.borderBox;
    const afterBox = preset.inHome3.client.borderBox;

    expandedMouse.powerLift(critical, criticalBox.center);
    expect(isDragging(critical)).toBe(true);

    // before critical
    expect(before.style.transform).toBe('');

    // no movement yet so no transform
    expect(critical.style.transform).toBe('');

    // after critical is moved forward
    expect(after.style.transform).toBe(
      `translate(0px, ${preset.inHome2.displaceBy.y}px)`,
    );

    expandedMouse.move(critical, afterBox.center);

    // still not moved
    expect(after.style.transform).toBe('');

    // critical has now moved
    expect(critical.style.transform.startsWith('translate')).toBe(true);

    // after no longer displaced (moved backwards)
    expect(after.style.transform).toBe('');
  });
});
