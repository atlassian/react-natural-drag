// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { isDragging } from './util/helpers';
import App from './util/app';
import { forEachSensor, simpleLift, type Control } from './util/controls';
import getBodyElement from '../../../src/view/get-body-element';

it('should have any errors when body is changed just before unmount', () => {
  jest.useFakeTimers();
  const { unmount } = render(<App />);

  expect(() => {
    getBodyElement().innerHTML = '';
    unmount();
    jest.runOnlyPendingTimers();
  }).not.toThrow();

  jest.useRealTimers();
});

forEachSensor((control: Control) => {
  it('should have any errors when body is changed just before unmount: mid drag', () => {
    const { unmount, getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    // mid drag
    simpleLift(control, handle);
    expect(isDragging(handle)).toEqual(true);

    expect(() => {
      getBodyElement().innerHTML = '';
      unmount();
      jest.runOnlyPendingTimers();
    }).not.toThrow();
  });
});
