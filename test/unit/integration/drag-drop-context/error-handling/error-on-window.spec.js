// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { RbdInvariant } from '../../../../../src/invariant';
import App from '../../util/app';
import { simpleLift, keyboard } from '../../util/controls';
import { isDragging } from '../../util/helpers';
import { withError, withWarn, withoutError } from '../../../../util/console';
import { getRuntimeError } from '../../../../util/cause-runtime-error';

function getRbdErrorEvent(): Event {
  return new window.ErrorEvent('error', {
    error: new RbdInvariant('my invariant'),
    cancelable: true,
  });
}

it('should abort any active drag (rbd error)', () => {
  const { getByTestId } = render(<App />);

  simpleLift(keyboard, getByTestId('0'));
  expect(isDragging(getByTestId('0'))).toBe(true);
  const event: Event = getRbdErrorEvent();

  withWarn(() => {
    withError(() => {
      window.dispatchEvent(event);
    });
  });

  // drag aborted
  expect(isDragging(getByTestId('0'))).toBe(false);
  // error event prevented
  expect(event.defaultPrevented).toBe(true);
});

it('should abort any active drag (non-rbd error)', () => {
  const { getByTestId } = render(<App />);
  simpleLift(keyboard, getByTestId('0'));
  expect(isDragging(getByTestId('0'))).toBe(true);
  const event: Event = getRuntimeError();

  // not logging the raw error
  withoutError(() => {
    // logging that the drag was aborted
    withWarn(() => {
      window.dispatchEvent(event);
    });
  });

  // drag aborted
  expect(isDragging(getByTestId('0'))).toBe(false);
  // error event not prevented
  expect(event.defaultPrevented).toBe(false);
});
