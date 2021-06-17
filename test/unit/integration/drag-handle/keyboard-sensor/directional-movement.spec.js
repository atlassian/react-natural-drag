// @flow
import * as React from 'react';
import { fireEvent, render, createEvent } from '@testing-library/react';
import * as keyCodes from '../../../../../src/view/key-codes';
import App from '../../util/app';
import { simpleLift, keyboard } from '../../util/controls';

jest.useFakeTimers();

it('should move up when pressing the up arrow', () => {
  const onDragUpdate = jest.fn();
  const { getByText } = render(<App onDragUpdate={onDragUpdate} />);
  const handle: HTMLElement = getByText('item: 1');

  simpleLift(keyboard, handle);

  const event: Event = createEvent.keyDown(handle, {
    keyCode: keyCodes.arrowUp,
  });
  fireEvent(handle, event);

  // flush async responder
  jest.runOnlyPendingTimers();
  expect(onDragUpdate).toHaveBeenCalled();
  expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(0);

  // event consumed
  expect(event.defaultPrevented).toBe(true);
});

it('should move down when pressing the down arrow', () => {
  const onDragUpdate = jest.fn();
  const { getByText } = render(<App onDragUpdate={onDragUpdate} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  const event: Event = createEvent.keyDown(handle, {
    keyCode: keyCodes.arrowDown,
  });
  fireEvent(handle, event);

  // flush async responder
  jest.runOnlyPendingTimers();
  expect(onDragUpdate).toHaveBeenCalled();
  expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(1);

  // event consumed
  expect(event.defaultPrevented).toBe(true);
});

it('should move right when pressing the right arrow', () => {
  const onDragUpdate = jest.fn();
  const { getByText } = render(
    <App onDragUpdate={onDragUpdate} direction="horizontal" />,
  );
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  const event: Event = createEvent.keyDown(handle, {
    keyCode: keyCodes.arrowRight,
  });
  fireEvent(handle, event);

  // flush async responder
  jest.runOnlyPendingTimers();
  expect(onDragUpdate).toHaveBeenCalled();
  expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(1);

  // event consumed
  expect(event.defaultPrevented).toBe(true);
});

it('should move left when pressing the left arrow', () => {
  const onDragUpdate = jest.fn();
  const { getByText } = render(
    <App onDragUpdate={onDragUpdate} direction="horizontal" />,
  );
  const handle: HTMLElement = getByText('item: 1');

  simpleLift(keyboard, handle);

  const event: Event = createEvent.keyDown(handle, {
    keyCode: keyCodes.arrowLeft,
  });
  fireEvent(handle, event);

  // flush async responder
  jest.runOnlyPendingTimers();
  expect(onDragUpdate).toHaveBeenCalled();
  expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(0);

  // event consumed
  expect(event.defaultPrevented).toBe(true);
});
