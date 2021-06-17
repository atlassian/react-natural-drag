// @flow
import * as React from 'react';
import type { Position } from 'css-box-model';
import { render, fireEvent, createEvent } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import {
  sloppyClickThreshold,
  primaryButton,
} from '../../../../../src/view/use-sensor-marshal/sensors/use-mouse-sensor';
import { isDragging } from '../../util/helpers';
import App from '../../util/app';
// blocking announcement messages
jest.spyOn(console, 'warn').mockImplementation((message: string) => {
  invariant(
    message.includes('Message not passed to screen reader'),
    `Unexpected console.warn("${message}")`,
  );
});

it('should start a drag after sufficient movement', () => {
  const valid: Position[] = [
    { x: 0, y: sloppyClickThreshold },
    { x: 0, y: -sloppyClickThreshold },
    { x: sloppyClickThreshold, y: 0 },
    { x: -sloppyClickThreshold, y: 0 },
  ];

  valid.forEach((point: Position) => {
    const { getByText, unmount } = render(<App />);

    const handle: HTMLElement = getByText('item: 0');

    const mouseDown: MouseEvent = createEvent.mouseDown(handle);

    fireEvent(handle, mouseDown);
    // important that this is called to prevent focus
    expect(mouseDown.defaultPrevented).toBe(true);

    // not dragging yet
    expect(isDragging(handle)).toBe(false);

    // mouse move to start drag

    const mouseMove: MouseEvent = createEvent.mouseMove(handle, {
      clientX: point.x,
      clientY: point.y,
    });
    fireEvent(window, mouseMove);
    // we are using the event - so prevent default is called
    expect(mouseMove.defaultPrevented).toBe(true);

    // now dragging
    expect(isDragging(handle)).toBe(true);

    unmount();
  });
});

it('should allow standard click events', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  const click: MouseEvent = createEvent.click(handle);
  fireEvent(handle, click);

  expect(click.defaultPrevented).toBe(false);
});

it('should not call preventDefault on mouse movements while we are not sure if a drag is starting', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  // start pending
  fireEvent.mouseDown(handle, {
    clientX: 0,
    clientY: 0,
    button: primaryButton,
  });

  // not dragging yet
  const mouseMove: MouseEvent = createEvent.mouseMove(handle, {
    clientX: 0,
    clientY: sloppyClickThreshold - 1,
  });
  fireEvent(handle, mouseMove);

  expect(isDragging(handle)).toBe(false);
  expect(mouseMove.defaultPrevented).toBe(false);
});

it('should call preventDefault on the initial mousedown event to prevent the element gaining focus', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  const mouseDown: MouseEvent = createEvent.mouseDown(handle);
  fireEvent(handle, mouseDown);

  expect(mouseDown.defaultPrevented).toBe(true);
});

it('should allow multiple false starts', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  Array.from({ length: 5 }).forEach(() => {
    fireEvent.mouseDown(handle);
    fireEvent.mouseUp(handle);

    expect(isDragging(handle)).toBe(false);
  });

  fireEvent.mouseDown(handle);
  fireEvent.mouseMove(handle, {
    clientX: 0,
    clientY: sloppyClickThreshold,
  });

  expect(isDragging(handle)).toBe(true);
});

it('should not start a drag if there was too little mouse movement while mouse was pressed', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  fireEvent.mouseDown(handle);
  fireEvent.mouseMove(handle, {
    clientX: 0,
    clientY: sloppyClickThreshold - 1,
  });

  expect(isDragging(handle)).toBe(false);
});

it('should not start a drag if not using the primary mouse button', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  const mouseDown: Event = createEvent.mouseDown(handle, {
    button: primaryButton + 1,
  });
  fireEvent(handle, mouseDown);
  fireEvent.mouseMove(handle, {
    clientX: 0,
    clientY: sloppyClickThreshold,
  });

  expect(isDragging(handle)).toBe(false);
});

it('should not start a drag if a modifier key was used while pressing the mouse down', () => {
  // if any drag is started with these keys pressed then we do not start a drag
  const keys: string[] = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  keys.forEach((key: string) => {
    const mouseDown: MouseEvent = createEvent.mouseDown(handle, {
      [key]: true,
    });
    fireEvent(handle, mouseDown);
    fireEvent.mouseMove(handle, {
      clientX: 0,
      clientY: sloppyClickThreshold,
    });

    expect(isDragging(handle)).toBe(false);
  });
});
