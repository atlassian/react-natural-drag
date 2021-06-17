// @flow
import type { PublicResult } from '../../../../../src/state/move-in-direction/move-in-direction-types';
import type {
  Viewport,
  DraggableDimension,
  DroppableDimension,
  DraggableDimensionMap,
  DroppableDimensionMap,
} from '../../../../../src/types';
import moveAxis from '../../../../../src/state/move-in-direction/move-axis';
import getViewport from '../../../../../src/view/window/get-viewport';
import {
  getPreset,
  getDroppableDimension,
  getDraggableDimension,
} from '../../../../util/dimension';
import getLiftEffect from '../../../../../src/state/get-lift-effect';

const preset = getPreset();
const viewport: Viewport = getViewport();

// The functionality of move-axis is covered by other files in this folder.
// This spec file is directed any any logic in move-axis/index.js

it('should return null if there are draggables in a destination list but none are visible', () => {
  const custom: DroppableDimension = getDroppableDimension({
    descriptor: {
      id: 'custom',
      type: 'TYPE',
      mode: 'standard',
    },
    borderBox: {
      left: preset.home.client.borderBox.left + 1,
      right: preset.home.client.borderBox.left + 10,
      top: 0,
      bottom: viewport.frame.bottom + 200,
    },
  });
  const notVisible: DraggableDimension = getDraggableDimension({
    descriptor: {
      id: 'not-visible',
      droppableId: custom.descriptor.id,
      type: custom.descriptor.type,
      index: 0,
    },
    borderBox: {
      left: preset.home.client.borderBox.left + 1,
      right: preset.home.client.borderBox.left + 10,
      // outside of the viewport
      top: viewport.frame.bottom + 1,
      bottom: viewport.frame.bottom + 10,
    },
  });
  const draggables: DraggableDimensionMap = {
    ...preset.draggables,
    [notVisible.descriptor.id]: notVisible,
  };
  const droppables: DroppableDimensionMap = {
    [preset.home.descriptor.id]: preset.home,
    [custom.descriptor.id]: custom,
  };
  const { afterCritical } = getLiftEffect({
    draggable: preset.inHome1,
    draggables,
    home: preset.home,
    viewport: preset.viewport,
  });

  const result: ?PublicResult = moveAxis({
    isMovingOnMainAxis: false,
    isMovingForward: true,
    previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
    draggable: preset.inHome1,
    isOver: preset.home,
    draggables,
    droppables,
    viewport,
    afterCritical,
  });

  expect(result).toBe(null);
});
