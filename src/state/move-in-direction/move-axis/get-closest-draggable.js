// @flow
import { type Position } from 'css-box-model';
import type {
  Viewport,
  DraggableDimension,
  DroppableDimension,
  LiftEffect,
} from '../../../types';
import { distance } from '../../position';
import { isTotallyVisible } from '../../visibility/is-visible';
import withDroppableDisplacement from '../../with-scroll-change/with-droppable-displacement';
import {
  getCurrentPageBorderBox,
  getCurrentPageBorderBoxCenter,
} from './without-starting-displacement';

type Args = {|
  pageBorderBoxCenter: Position,
  viewport: Viewport,
  // the droppable that is being moved to
  destination: DroppableDimension,
  // the droppables inside the destination
  insideDestination: DraggableDimension[],
  afterCritical: LiftEffect,
|};

export default ({
  pageBorderBoxCenter,
  viewport,
  destination,
  insideDestination,
  afterCritical,
}: Args): ?DraggableDimension => {
  const sorted: DraggableDimension[] = insideDestination
    .filter((draggable: DraggableDimension): boolean =>
      // Allowing movement to draggables that are not visible in the viewport
      // but must be visible in the droppable
      // We can improve this, but this limitation is easier for now
      isTotallyVisible({
        target: getCurrentPageBorderBox(draggable, afterCritical),
        destination,
        viewport: viewport.frame,
        withDroppableDisplacement: true,
      }),
    )
    .sort((a: DraggableDimension, b: DraggableDimension): number => {
      // Need to consider the change in scroll in the destination
      const distanceToA = distance(
        pageBorderBoxCenter,
        withDroppableDisplacement(
          destination,
          getCurrentPageBorderBoxCenter(a, afterCritical),
        ),
      );
      const distanceToB = distance(
        pageBorderBoxCenter,
        withDroppableDisplacement(
          destination,
          getCurrentPageBorderBoxCenter(b, afterCritical),
        ),
      );

      // if a is closer - return a
      if (distanceToA < distanceToB) {
        return -1;
      }

      // if b is closer - return b
      if (distanceToB < distanceToA) {
        return 1;
      }

      // if the distance to a and b are the same:
      // return the one with the lower index (it will be higher on the main axis)
      return a.descriptor.index - b.descriptor.index;
    });

  return sorted[0] || null;
};
