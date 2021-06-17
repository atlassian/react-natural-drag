// @flow
import * as React from 'react';
import { createEvent, fireEvent, render } from '@testing-library/react';
import * as keyCodes from '../../../../../src/view/key-codes';
import App from '../../util/app';
import { isDragging, getDropReason } from '../../util/helpers';
import supportedEventName from '../../../../../src/view/use-sensor-marshal/sensors/util/supported-page-visibility-event-name';
import { forEachSensor, simpleLift, type Control } from '../../util/controls';

forEachSensor((control: Control) => {
  it('should cancel when pressing escape', () => {
    const onDragEnd = jest.fn();
    const { getByText } = render(<App onDragEnd={onDragEnd} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    // cancel
    const event: Event = createEvent.keyDown(handle, {
      keyCode: keyCodes.escape,
    });

    fireEvent(handle, event);

    // event consumed
    expect(event.defaultPrevented).toBe(true);
    // drag ended
    expect(isDragging(handle)).toBe(false);
    expect(onDragEnd.mock.calls[0][0].reason).toBe('CANCEL');
  });

  it('should cancel when window is resized', () => {
    const onDragEnd = jest.fn();
    const { getByText } = render(<App onDragEnd={onDragEnd} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    // cancel
    const event: Event = new Event('resize', {
      bubbles: true,
      cancelable: true,
    });

    fireEvent(handle, event);

    // event not consumed as it is an indirect cancel
    expect(event.defaultPrevented).toBe(false);
    // drag ended
    expect(isDragging(handle)).toBe(false);
    expect(onDragEnd.mock.calls[0][0].reason).toBe('CANCEL');
  });

  it('should cancel when there is a visibility change', () => {
    const onDragEnd = jest.fn();
    const { getByText } = render(<App onDragEnd={onDragEnd} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    // cancel
    const event: Event = new Event(supportedEventName, {
      bubbles: true,
      cancelable: true,
    });

    fireEvent(handle, event);

    // event not consumed as it is an indirect cancel
    expect(event.defaultPrevented).toBe(false);
    // drag ended
    expect(isDragging(handle)).toBe(false);
    expect(getDropReason(onDragEnd)).toBe('CANCEL');
  });
});
