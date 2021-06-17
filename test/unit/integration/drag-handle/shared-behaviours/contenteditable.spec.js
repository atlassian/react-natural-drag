// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { forEachSensor, type Control, simpleLift } from '../../util/controls';
import { isDragging } from '../../util/helpers';
import {
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '../../../../../src';
import App, { type Item } from '../../util/app';

forEachSensor((control: Control) => {
  beforeEach(() => {
    // using content editable in particular ways causes react logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    // $ExpectError - mock
    console.error.mockRestore();
  });

  it('should block the drag if the drag handle is itself contenteditable', () => {
    const renderItem = (item: Item) => (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
    ) => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        data-is-dragging={snapshot.isDragging}
        data-testid={item.id}
        contentEditable
      />
    );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const handle: HTMLElement = getByTestId('0');

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(false);
  });

  it('should block the drag if originated from a child contenteditable', () => {
    const renderItem = (item: Item) => (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
    ) => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        data-is-dragging={snapshot.isDragging}
        data-testid={`handle-${item.id}`}
      >
        <div data-testid={`inner-${item.id}`} contentEditable />
      </div>
    );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const inner: HTMLElement = getByTestId('inner-0');
    const handle: HTMLElement = getByTestId('handle-0');

    simpleLift(control, inner);

    expect(isDragging(handle)).toBe(false);
  });

  it('should block the drag if originated from a child of a child contenteditable', () => {
    const renderItem = (item: Item) => (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
    ) => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        data-is-dragging={snapshot.isDragging}
        data-testid={`handle-${item.id}`}
      >
        <div contentEditable>
          <p>hello there</p>
          <span data-testid={`inner-${item.id}`}>Edit me!</span>
        </div>
      </div>
    );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const inner: HTMLElement = getByTestId('inner-0');
    const handle: HTMLElement = getByTestId('handle-0');

    simpleLift(control, inner);

    expect(isDragging(handle)).toBe(false);
  });

  it('should not block if contenteditable is set to false', () => {
    const renderItem = (item: Item) => (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
    ) => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        data-is-dragging={snapshot.isDragging}
        data-testid={item.id}
        contentEditable="false"
      />
    );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const handle: HTMLElement = getByTestId('0');

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(true);
  });

  it('should not block a drag if dragging interactive elements is allowed', () => {
    const items: Item[] = [{ id: '0', canDragInteractiveElements: true }];

    const renderItem = (item: Item) => (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
    ) => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        data-is-dragging={snapshot.isDragging}
        data-testid={item.id}
        contentEditable
      />
    );

    const { getByTestId } = render(
      <App items={items} renderItem={renderItem} />,
    );
    const handle: HTMLElement = getByTestId('0');

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(true);
  });
});
