// @flow
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import App, { type Item } from '../../util/app';
import { touch, simpleLift } from '../../util/controls';
import { forcePressThreshold } from '../../../../../src/view/use-sensor-marshal/sensors/use-touch-sensor';
import { isDragging } from '../../util/helpers';

jest.useFakeTimers();

function getForceChange(force: number): Event {
  const event: Event = new Event('touchforcechange', {
    bubbles: true,
    cancelable: true,
  });
  // $FlowFixMe - being amazing
  event.touches = [
    {
      clientX: 0,
      clientY: 0,
      force,
    },
  ];
  return event;
}

// Note: this behaviour is a bit strange as we are working around a safari issue
// https://github.com/atlassian/react-beautiful-dnd/issues/1401
describe('force press not respected (default)', () => {
  it('should not abort presses that do not have enought pressure', () => {
    const { getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    touch.preLift(handle);

    const first: Event = getForceChange(forcePressThreshold - 1);
    fireEvent(handle, first);
    expect(first.defaultPrevented).toBe(false);

    touch.lift(handle);

    const second: Event = getForceChange(forcePressThreshold - 1);
    fireEvent(handle, second);
    expect(second.defaultPrevented).toBe(false);

    // force presses did not abort the pending or actual drag
    expect(isDragging(handle)).toBe(true);
  });

  it('should not prevent a force press when pending (strange I know)', () => {
    const { getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    touch.preLift(handle);

    const first: Event = getForceChange(forcePressThreshold);
    fireEvent(handle, first);
    expect(first.defaultPrevented).toBe(false);

    touch.lift(handle);
    // did not prevent lifting
    expect(isDragging(handle)).toBe(true);
  });

  it('prevent a force press when dragging', () => {
    const { getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    touch.preLift(handle);

    const first: Event = getForceChange(forcePressThreshold);
    fireEvent(handle, first);
    expect(first.defaultPrevented).toBe(false);

    touch.lift(handle);
    expect(isDragging(handle)).toBe(true);

    // this force press will be prevented
    const second: Event = getForceChange(forcePressThreshold);
    fireEvent(handle, second);
    expect(second.defaultPrevented).toBe(true);

    // force presses did not abort the drag
    expect(isDragging(handle)).toBe(true);
  });
});

describe('force press respected', () => {
  const items: Item[] = [{ id: '0', shouldRespectForcePress: true }];

  it('should cancel a pending drag if a force press is registered', () => {
    const { getByText } = render(<App items={items} />);
    const handle: HTMLElement = getByText('item: 0');

    touch.preLift(handle);

    // indirect cancel so event is not consumed
    const press: Event = getForceChange(forcePressThreshold);
    fireEvent(handle, press);
    expect(press.defaultPrevented).toBe(false);

    touch.lift(handle);

    expect(isDragging(handle)).toBe(false);
  });

  it('should cancel a drag if a force press is registered', () => {
    const { getByText } = render(<App items={items} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(touch, handle);

    // indirect cancel so event is not consumed
    const press: Event = getForceChange(forcePressThreshold);
    fireEvent(handle, press);
    expect(press.defaultPrevented).toBe(false);

    // drag is no more
    expect(isDragging(handle)).toBe(false);
  });

  it('should abort a force press if dragging and some movement has occurred', () => {
    const { getByText } = render(<App items={items} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(touch, handle);

    fireEvent.touchMove(handle, { touches: [{ clientX: 0, clientY: 0 }] });

    // consuming event and not cancelling after movement
    const press: Event = getForceChange(forcePressThreshold);
    fireEvent(handle, press);
    expect(press.defaultPrevented).toBe(true);

    expect(isDragging(handle)).toBe(true);
  });
});

it('should not listen to force press changes after a drag has started', () => {
  const withForcePress: Item[] = [{ id: '0', shouldRespectForcePress: true }];

  const { getByText, rerender } = render(<App items={withForcePress} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(touch, handle);

  // changing
  const withoutForcePress: Item[] = [
    { id: '0', shouldRespectForcePress: false },
  ];
  rerender(<App items={withoutForcePress} />);

  // even though the shouldRespectForcePress value has changed it will still use the original
  // this is important as during a drag the dragging item can be removed from the registry and we
  // don't want to look it up
  fireEvent(handle, getForceChange(forcePressThreshold));

  // drag is no more
  expect(isDragging(handle)).toBe(false);
});
