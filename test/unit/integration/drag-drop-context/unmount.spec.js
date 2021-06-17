// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import DragDropContext from '../../../../src/view/drag-drop-context';

it('should not throw when unmounting', () => {
  const { unmount } = render(
    <DragDropContext onDragEnd={() => {}}>{null}</DragDropContext>,
  );

  expect(() => unmount()).not.toThrow();
});

it('should clean up any window event handlers', () => {
  jest.spyOn(window, 'addEventListener');
  jest.spyOn(window, 'removeEventListener');

  const { unmount } = render(
    <DragDropContext onDragEnd={() => {}}>{null}</DragDropContext>,
  );

  unmount();

  expect(window.addEventListener.mock.calls).toHaveLength(
    window.removeEventListener.mock.calls.length,
  );
  // validation
  expect(window.addEventListener).toHaveBeenCalled();
  expect(window.removeEventListener).toHaveBeenCalled();
});
