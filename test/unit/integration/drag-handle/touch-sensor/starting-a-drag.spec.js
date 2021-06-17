// @flow
import React from 'react';
import { createEvent, fireEvent, render } from '@testing-library/react';
import App from '../../util/app';
import { isDragging } from '../../util/helpers';
import { defaultTimeForLongPress } from '../../../../../src/view/use-sensor-marshal/sensors/use-touch-sensor';

jest.useFakeTimers();

function getTouchStart(handle: HTMLElement): Event {
  return createEvent.touchStart(handle, {
    touches: [{ clientX: 0, clientY: 0 }],
  });
}

it('should start dragging after a long press', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');
  const touchStart: Event = getTouchStart(handle);

  fireEvent(handle, touchStart);
  // not calling event.preventDefault() to allow
  // as many browser interactions as possible
  expect(touchStart.defaultPrevented).toBe(false);

  // not dragging yet
  expect(isDragging(handle)).toBe(false);

  // allow long press to run
  jest.runOnlyPendingTimers();

  // now dragging
  expect(isDragging(handle)).toBe(true);
});

it('should not start dragging if finished before a long press', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');
  const touchStart: Event = getTouchStart(handle);

  fireEvent(handle, touchStart);
  // not calling event.preventDefault() to allow
  // as many browser interactions as possible
  expect(touchStart.defaultPrevented).toBe(false);

  // not dragging yet
  expect(isDragging(handle)).toBe(false);

  // allow long press to run
  jest.advanceTimersByTime(defaultTimeForLongPress - 1);

  // not dragging yet
  expect(isDragging(handle)).toBe(false);

  const touchEnd: Event = createEvent.touchEnd(handle);
  fireEvent(handle, touchEnd);

  // not a direct cancel
  expect(touchEnd.defaultPrevented).toBe(false);

  // flushing any timers
  jest.runOnlyPendingTimers();

  expect(isDragging(handle)).toBe(false);
});

it('should allow a false start', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  // a first attempt that is not successful
  fireEvent(handle, getTouchStart(handle));
  jest.advanceTimersByTime(defaultTimeForLongPress - 1);
  fireEvent.touchEnd(handle);
  expect(isDragging(handle)).toBe(false);

  // Let's try again - this time we will wait

  fireEvent(handle, getTouchStart(handle));
  jest.advanceTimersByTime(defaultTimeForLongPress);
  expect(isDragging(handle)).toBe(true);
});
