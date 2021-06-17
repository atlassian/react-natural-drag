// @flow
import * as React from 'react';
import type { BoxModel } from 'css-box-model';
import { invariant } from '../../../../src/invariant';
import * as attributes from '../../../../src/view/data-attributes';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DroppableProvided,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '../../../../src';
import type {
  DroppableDescriptor,
  DraggableDescriptor,
  DraggableId,
  DroppableId,
} from '../../../../src/types';
import { noop } from '../../../../src/empty';
import { getComputedSpacing, getPreset } from '../../../util/dimension';
import { toDroppableList } from '../../../../src/state/dimension-structures';
import getDraggablesInsideDroppable from '../../../../src/state/get-draggables-inside-droppable';

const preset = getPreset();

type CardProps = {|
  index: number,
  descriptor: DraggableDescriptor,
|};

function Card(props: CardProps) {
  return (
    <Draggable draggableId={props.descriptor.id} index={props.index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          data-testid={props.descriptor.id}
          data-is-dragging={snapshot.isDragging}
          data-is-over={snapshot.draggingOver}
        />
      )}
    </Draggable>
  );
}

type ColumnProps = {|
  index: number,
  descriptor: DroppableDescriptor,
|};

function Column(props: ColumnProps) {
  return (
    <Draggable draggableId={props.descriptor.id} index={props.index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          data-testid={props.descriptor.id}
          data-is-dragging={snapshot.isDragging}
        >
          <Droppable
            droppableId={props.descriptor.id}
            type={props.descriptor.type}
          >
            {(droppableProvided: DroppableProvided) => (
              <div
                {...droppableProvided.droppableProps}
                ref={droppableProvided.innerRef}
              >
                {getDraggablesInsideDroppable(
                  props.descriptor.id,
                  preset.draggables,
                ).map((draggable, index) => (
                  <Card
                    key={draggable.descriptor.id}
                    descriptor={draggable.descriptor}
                    index={index}
                  />
                ))}
                {droppableProvided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default function Board() {
  return (
    <DragDropContext onDragEnd={noop}>
      <Droppable droppableId="BOARD" type="BOARD" direction="horizontal">
        {(provided: DroppableProvided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {toDroppableList(preset.droppables).map((droppable, index) => (
              <Column
                key={droppable.descriptor.id}
                descriptor={droppable.descriptor}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export function withPoorBoardDimensions(fn: (typeof preset) => void): void {
  const protoSpy = jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function fake() {
      invariant(
        this instanceof HTMLElement,
        'Expected "this" to be a HTMLElement',
      );

      const el: HTMLElement = ((this: any): HTMLElement);

      const droppableId: ?DroppableId = el.getAttribute(
        attributes.droppable.id,
      );
      if (droppableId) {
        return preset.droppables[droppableId].client.borderBox;
      }

      const draggableId: ?DraggableId = el.getAttribute(
        attributes.draggable.id,
      );
      invariant(draggableId, 'Expected element to be a draggable');

      return preset.draggables[draggableId].client.borderBox;
    });

  // Stubbing out totally - not including margins in this
  const styleSpy = jest
    .spyOn(window, 'getComputedStyle')
    .mockImplementation(function fake(el: HTMLElement) {
      function getSpacing(box: BoxModel) {
        return getComputedSpacing({
          margin: box.margin,
          padding: box.padding,
          border: box.border,
        });
      }

      const droppableId: ?DroppableId = el.getAttribute(
        attributes.droppable.id,
      );

      if (droppableId) {
        if (droppableId === 'BOARD') {
          return getComputedSpacing({});
        }

        return getSpacing(preset.droppables[droppableId].client);
      }

      const draggableId: ?DraggableId = el.getAttribute(
        attributes.draggable.id,
      );

      // this can be the case when looking up the tree for a scroll container
      if (!draggableId) {
        return getComputedSpacing({});
      }

      if (preset.draggables[draggableId]) {
        return getSpacing(preset.draggables[draggableId].client);
      }

      // columns are also draggables for our example
      if (preset.droppables[draggableId]) {
        return getSpacing(preset.droppables[draggableId].client);
      }

      throw new Error(`Unable to find spacing for draggable: ${draggableId}`);
    });

  try {
    fn(preset);
  } finally {
    protoSpy.mockRestore();
    styleSpy.mockRestore();
  }
}
