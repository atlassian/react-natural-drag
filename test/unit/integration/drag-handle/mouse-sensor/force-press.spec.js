// @flow
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { mouse, simpleLift } from '../../util/controls';
import App, { type Item } from '../../util/app';
import { isDragging } from '../../util/helpers';

describe('force press is not respected', () => {
  it('should prevent the default of a `webkitmouseforcewillbegin` event', () => {
    const { getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    const event: Event = new Event('webkitmouseforcewillbegin', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, event);

    expect(event.defaultPrevented).toBe(true);

    // lift not prevented
    simpleLift(mouse, handle);
    expect(isDragging(handle)).toBe(true);
  });

  it('should prevent the default of a `webkitmouseforcedown` event', () => {
    const { getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    // while pending
    mouse.preLift(handle);
    const first: Event = new Event('webkitmouseforcedown', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, first);
    expect(first.defaultPrevented).toBe(true);

    // while dragging
    mouse.lift(handle);
    const second: Event = new Event('webkitmouseforcedown', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, second);
    expect(second.defaultPrevented).toBe(true);

    // dragging not aborted
    expect(isDragging(handle)).toBe(true);
  });
});

describe('force press is respected', () => {
  it('should not prevent the default of a `webkitmouseforcewillbegin` event', () => {
    const items: Item[] = [{ id: '0', shouldRespectForcePress: true }];
    const { getByText } = render(<App items={items} />);
    const handle: HTMLElement = getByText('item: 0');

    const event: Event = new Event('webkitmouseforcewillbegin', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('should cancel a pending drag with a webkitmouseforcedown event', () => {
    const items: Item[] = [{ id: '0', shouldRespectForcePress: true }];
    const { getByText } = render(<App items={items} />);
    const handle: HTMLElement = getByText('item: 0');

    // while pending
    mouse.preLift(handle);
    const event: Event = new Event('webkitmouseforcedown', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, event);
    expect(event.defaultPrevented).toBe(false);
    // pre drag will be aborted

    mouse.lift(handle);
    expect(isDragging(handle)).toBe(false);
  });

  it('should cancel an active drag with a webkitmouseforcedown event', () => {
    const items: Item[] = [{ id: '0', shouldRespectForcePress: true }];
    const { getByText } = render(<App items={items} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(mouse, handle);
    expect(isDragging(handle)).toBe(true);

    const event: Event = new Event('webkitmouseforcedown', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, event);
    expect(event.defaultPrevented).toBe(false);

    expect(isDragging(handle)).toBe(false);
  });
});
