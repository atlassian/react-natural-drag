// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import App from '../../util/app';
import { simpleLift, keyboard } from '../../util/controls';
import { isDragging } from '../../util/helpers';
import { withError } from '../../../../util/console';

it('should recover from rbd errors', () => {
  let hasThrown: boolean = false;
  function CanThrow(props: { shouldThrow: boolean }) {
    if (!hasThrown && props.shouldThrow) {
      hasThrown = true;
      invariant(false, 'throwing');
    }
    return null;
  }

  const { rerender, getByTestId } = render(
    <App anotherChild={<CanThrow shouldThrow={false} />} />,
  );

  simpleLift(keyboard, getByTestId('0'));
  expect(isDragging(getByTestId('0'))).toBe(true);

  withError(() => {
    rerender(<App anotherChild={<CanThrow shouldThrow />} />);
  });

  expect(isDragging(getByTestId('0'))).toBe(false);
});

it('should not recover from non-rbd errors', () => {
  let hasThrown: boolean = false;
  function CanThrow(props: { shouldThrow: boolean }) {
    if (!hasThrown && props.shouldThrow) {
      hasThrown = true;
      throw new Error('Boom');
    }
    return null;
  }

  const { rerender, getByTestId } = render(
    <App anotherChild={<CanThrow shouldThrow={false} />} />,
  );

  simpleLift(keyboard, getByTestId('0'));
  expect(isDragging(getByTestId('0'))).toBe(true);

  withError(() => {
    expect(() => {
      rerender(<App anotherChild={<CanThrow shouldThrow />} />);
    }).toThrow();
  });
});

it('should not recover from runtime errors', () => {
  let hasThrown: boolean = false;
  function CanThrow(props: { shouldThrow: boolean }) {
    if (!hasThrown && props.shouldThrow) {
      hasThrown = true;
      // Boom: TypeError
      window.foo();
    }
    return null;
  }

  const { rerender, getByTestId } = render(
    <App anotherChild={<CanThrow shouldThrow={false} />} />,
  );

  simpleLift(keyboard, getByTestId('0'));
  expect(isDragging(getByTestId('0'))).toBe(true);

  withError(() => {
    expect(() => {
      rerender(<App anotherChild={<CanThrow shouldThrow />} />);
    }).toThrow();
  });
});
