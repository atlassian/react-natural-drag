// @flow
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import App from '../../util/app';
import { touch } from '../../util/controls';
import { isDragging } from '../../util/helpers';

jest.useFakeTimers();

it('should opt of a context menu', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  touch.preLift(handle);

  // prevented during a pending drag
  const first: Event = new Event('contextmenu', {
    bubbles: true,
    cancelable: true,
  });
  fireEvent(handle, first);
  expect(first.defaultPrevented).toBe(true);

  touch.lift(handle);

  // prevented during a drag
  const second: Event = new Event('contextmenu', {
    bubbles: true,
    cancelable: true,
  });
  fireEvent(handle, second);
  expect(second.defaultPrevented).toBe(true);

  expect(isDragging(handle)).toBe(true);
});
