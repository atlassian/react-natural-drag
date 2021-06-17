// @flow
import * as React from 'react';
import { createEvent, fireEvent, render } from '@testing-library/react';
import * as keyCodes from '../../../../../src/view/key-codes';
import App from '../../util/app';
import { simpleLift, keyboard } from '../../util/controls';
import { isDragging } from '../../util/helpers';

it('should prevent using keyboard keys that modify scroll', () => {
  const keys: number[] = [
    keyCodes.pageUp,
    keyCodes.pageDown,
    keyCodes.home,
    keyCodes.end,
  ];
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  keys.forEach((keyCode: number) => {
    const event: Event = createEvent.keyDown(handle, { keyCode });
    fireEvent(handle, event);

    expect(event.defaultPrevented).toBe(true);
    expect(isDragging(handle)).toBe(true);
  });
});
