// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { render } from '@testing-library/react';
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from '../../../../src';
import getBodyElement from '../../../../src/view/get-body-element';
import App, { type Item } from '../util/app';
import { isDragging } from '../util/helpers';
import { simpleLift, mouse } from '../util/controls';

const portal: HTMLElement = document.createElement('div');
getBodyElement().appendChild(portal);

afterAll(() => {
  getBodyElement().removeChild(portal);
});

const renderItem = (item: Item) => (
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot,
) => {
  const child: React.Node = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-testid={item.id}
      data-is-dragging={snapshot.isDragging}
    >
      Drag me!
    </div>
  );

  if (!snapshot.isDragging) {
    return child;
  }

  return ReactDOM.createPortal(child, portal);
};

it('should allow consumers to use their own portal', () => {
  const { getByTestId } = render(<App renderItem={renderItem} />);
  const before: HTMLElement = getByTestId('0');

  // not in portal yet
  expect(before.parentElement).not.toBe(portal);
  expect(isDragging(before)).toBe(false);

  // moved to portal after lift
  simpleLift(mouse, before);
  const inPortal: HTMLElement = getByTestId('0');
  expect(inPortal.parentElement).toBe(portal);
  expect(before).not.toBe(inPortal);
  expect(isDragging(inPortal)).toBe(true);

  // out of portal after drop
  mouse.drop(inPortal);
  const after: HTMLElement = getByTestId('0');
  expect(after.parentElement).not.toBe(portal);
  expect(after).not.toBe(inPortal);
  expect(isDragging(after)).toBe(false);
});
