// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { forEachSensor, type Control, simpleLift } from '../../util/controls';
import { isDragging } from '../../util/helpers';
import Board from '../../util/board';

forEachSensor((control: Control) => {
  it('should not start a drag on a parent if a child drag handle has already received the event', () => {
    const { getByTestId } = render(<Board />);
    const cardHandle: HTMLElement = getByTestId('inhome1');
    const columnHandle: HTMLElement = getByTestId('home');

    simpleLift(control, cardHandle);

    expect(isDragging(cardHandle)).toBe(true);
    expect(isDragging(columnHandle)).toBe(false);
  });
  it('should start a drag on a pare~nt the event is trigged on the parent', () => {
    const { getByTestId } = render(<Board />);
    const cardHandle: HTMLElement = getByTestId('inhome1');
    const columnHandle: HTMLElement = getByTestId('home');

    simpleLift(control, columnHandle);

    expect(isDragging(columnHandle)).toBe(true);
    expect(isDragging(cardHandle)).toBe(false);
  });
});
