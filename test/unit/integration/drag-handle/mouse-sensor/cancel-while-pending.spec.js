// @flow
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { sloppyClickThreshold } from '../../../../../src/view/use-sensor-marshal/sensors/use-mouse-sensor';
import App from '../../util/app';
import { isDragging } from '../../util/helpers';
import supportedEventName from '../../../../../src/view/use-sensor-marshal/sensors/util/supported-page-visibility-event-name';
import { mouse } from '../../util/controls';

const events: string[] = ['keydown', 'resize', supportedEventName];

it(`should cancel a pending drag on events: [${events.join(', ')}]`, () => {
  events.forEach((eventName: string) => {
    const { getByText, unmount } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    mouse.preLift(handle);

    const event: Event = new Event(eventName, {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, event);

    // not an explicit cancel - so event not consumed
    expect(event.defaultPrevented).toBe(false);

    // would normally start
    mouse.lift(handle);

    // drag not started
    expect(isDragging(handle)).toBe(false);

    unmount();
  });
});

it('should abort when there is a window scroll', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  fireEvent.mouseDown(handle);

  // abort
  const event: Event = new Event('scroll', {
    target: window,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(window, event);

  // would normally start
  fireEvent.mouseMove(handle, {
    clientX: 0,
    clientY: sloppyClickThreshold,
  });

  // event not consumed as it is an indirect cancel
  expect(event.defaultPrevented).toBe(false);
  // drag not started
  expect(isDragging(handle)).toBe(false);
});
