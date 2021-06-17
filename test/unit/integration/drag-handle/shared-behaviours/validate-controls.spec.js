// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { isDragging, getDropReason } from '../../util/helpers';
import App from '../../util/app';
import { forEachSensor, type Control } from '../../util/controls';

forEachSensor((control: Control) => {
  it('should control a successful drag through the sensor', () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();
    const { getByText } = render(
      <App onDragStart={onDragStart} onDragEnd={onDragEnd} />,
    );
    const handle: HTMLElement = getByText('item: 0');

    Array.from({ length: 4 }).forEach(() => {
      control.preLift(handle);
      expect(isDragging(handle)).toBe(false);

      control.lift(handle);
      expect(isDragging(handle)).toBe(true);

      // on drag start is async
      jest.runOnlyPendingTimers();
      expect(onDragStart).toHaveBeenCalled();

      // move
      control.move(handle);
      expect(isDragging(handle)).toBe(true);

      // drop
      expect(onDragEnd).not.toHaveBeenCalled();

      control.drop(handle);
      expect(isDragging(handle)).toBe(false);

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(getDropReason(onDragEnd)).toBe('DROP');

      onDragEnd.mockClear();
    });
  });

  it('should control a cancel through the sensor', () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();
    const { getByText } = render(
      <App onDragStart={onDragStart} onDragEnd={onDragEnd} />,
    );
    const handle: HTMLElement = getByText('item: 0');

    Array.from({ length: 4 }).forEach(() => {
      control.preLift(handle);
      expect(isDragging(handle)).toBe(false);

      control.lift(handle);
      expect(isDragging(handle)).toBe(true);

      // on drag start is async
      jest.runOnlyPendingTimers();
      expect(onDragStart).toHaveBeenCalled();

      // move
      control.move(handle);
      expect(isDragging(handle)).toBe(true);

      control.cancel(handle);

      expect(isDragging(handle)).toBe(false);
      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(getDropReason(onDragEnd)).toBe('CANCEL');

      onDragEnd.mockClear();
    });
  });
});
