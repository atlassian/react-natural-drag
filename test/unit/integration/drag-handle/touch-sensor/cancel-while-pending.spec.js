// @flow
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import App from '../../util/app';
import { isDragging } from '../../util/helpers';
import supportedEventName from '../../../../../src/view/use-sensor-marshal/sensors/util/supported-page-visibility-event-name';
import { touch } from '../../util/controls';

jest.useFakeTimers();

const events: string[] = [
  'orientationchange',
  'keydown',
  'resize',
  supportedEventName,
  // moving before a long press
  'touchmove',
];

it(`should cancel a pending drag on events: [${events.join(', ')}]`, () => {
  events.forEach((eventName: string) => {
    const { getByText, unmount } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    touch.preLift(handle);

    const event: Event = new Event(eventName, {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(handle, event);

    // not an explicit cancel - so event not consumed
    expect(event.defaultPrevented).toBe(false);

    // would normally start
    touch.lift(handle);

    // drag not started
    expect(isDragging(handle)).toBe(false);

    unmount();
  });
});
