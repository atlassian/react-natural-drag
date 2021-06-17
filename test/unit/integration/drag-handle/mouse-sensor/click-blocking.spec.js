// @flow
import * as React from 'react';
import { createEvent, fireEvent, render } from '@testing-library/react';
import * as keyCodes from '../../../../../src/view/key-codes';
import { sloppyClickThreshold } from '../../../../../src/view/use-sensor-marshal/sensors/use-mouse-sensor';
import App from '../../util/app';
import { isDragging, getDropReason } from '../../util/helpers';
import { simpleLift, mouse } from '../../util/controls';

it('should not prevent a subsequent click if aborting during a pending drag', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  fireEvent.mouseDown(handle);

  // abort
  fireEvent.keyDown(handle, { keyCode: keyCodes.escape });

  // would normally start
  fireEvent.mouseMove(handle, {
    clientX: 0,
    clientY: sloppyClickThreshold,
  });

  // drag not started
  expect(isDragging(handle)).toBe(false);

  const click: Event = createEvent.click(handle);
  fireEvent(handle, click);

  expect(click.defaultPrevented).toBe(false);
});

it('should prevent a subsequent click if cancelling a drag', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(mouse, handle);
  expect(isDragging(handle)).toBe(true);

  // cancel
  fireEvent.keyDown(handle, { keyCode: keyCodes.escape });

  // drag cancelled
  expect(getDropReason(onDragEnd)).toBe('CANCEL');
  expect(isDragging(handle)).toBe(false);

  // click event prevented
  const click: Event = createEvent.click(handle);
  fireEvent(handle, click);
  expect(click.defaultPrevented).toBe(true);
});

it('should prevent a subsequent click if dropping a drag', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(mouse, handle);
  expect(isDragging(handle)).toBe(true);

  // cancel
  fireEvent.mouseUp(handle);

  expect(getDropReason(onDragEnd)).toBe('DROP');
  expect(isDragging(handle)).toBe(false);

  // click event prevented
  const click: Event = createEvent.click(handle);
  fireEvent(handle, click);
  expect(click.defaultPrevented).toBe(true);
});
