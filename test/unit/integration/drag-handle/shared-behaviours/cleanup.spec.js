// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { isDragging } from '../../util/helpers';
import App from '../../util/app';
import { forEachSensor, simpleLift, type Control } from '../../util/controls';

function getCallCount(myMock): number {
  return myMock.mock.calls.length;
}

forEachSensor((control: Control) => {
  it('should remove all window listeners when unmounting', () => {
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<App />);

    unmount();

    expect(getCallCount(window.addEventListener)).toEqual(
      getCallCount(window.removeEventListener),
    );
  });

  it('should remove all window listeners when unmounting mid drag', () => {
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');

    const { unmount, getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    // mid drag
    simpleLift(control, handle);
    expect(isDragging(handle)).toEqual(true);

    unmount();

    expect(getCallCount(window.addEventListener)).toEqual(
      getCallCount(window.removeEventListener),
    );
  });
});
