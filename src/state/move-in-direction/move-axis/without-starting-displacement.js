// @flow
import type { Position, Rect, Spacing } from 'css-box-model';
import type { DraggableDimension, LiftEffect } from '../../../types';
import { negate, subtract } from '../../position';
import { offsetByPosition } from '../../spacing';
import didStartAfterCritical from '../../did-start-after-critical';

export const getCurrentPageBorderBoxCenter = (
  draggable: DraggableDimension,
  afterCritical: LiftEffect,
): Position => {
  // If an item started displaced it is now resting
  // in a non-displaced location
  const original: Position = draggable.page.borderBox.center;
  return didStartAfterCritical(draggable.descriptor.id, afterCritical)
    ? subtract(original, afterCritical.displacedBy.point)
    : original;
};

export const getCurrentPageBorderBox = (
  draggable: DraggableDimension,
  afterCritical: LiftEffect,
): Spacing => {
  // If an item started displaced it is now resting
  // in a non-displaced location
  const original: Rect = draggable.page.borderBox;

  return didStartAfterCritical(draggable.descriptor.id, afterCritical)
    ? offsetByPosition(original, negate(afterCritical.displacedBy.point))
    : original;
};
