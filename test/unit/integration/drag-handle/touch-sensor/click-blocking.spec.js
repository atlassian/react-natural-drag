// @flow
import * as React from 'react';
import { fireEvent, render, createEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from '../../util/app';
import { touch, simpleLift } from '../../util/controls';

jest.useFakeTimers();

it('should block a click after a drag', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(touch, handle);
  act(() => touch.drop(handle));

  const click: Event = createEvent.click(handle);
  fireEvent(handle, click);

  expect(click.defaultPrevented).toBe(true);
});

it('should not block a click after an aborted pending drag', () => {
  const onDragStart = jest.fn();
  const { getByText } = render(<App onDragStart={onDragStart} />);
  const handle: HTMLElement = getByText('item: 0');

  // aborted before getting to a drag
  touch.preLift(handle);
  act(() => touch.cancel(handle));

  const click: Event = createEvent.click(handle);
  fireEvent(handle, click);

  expect(click.defaultPrevented).toBe(false);
  expect(onDragStart).not.toHaveBeenCalled();
});
