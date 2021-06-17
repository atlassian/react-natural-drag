// @flow
import type { Position } from 'css-box-model';
import type {
  DragImpact,
  DraggableDimension,
  DraggableDimensionMap,
  DroppableDimension,
  Viewport,
  DisplacedBy,
  LiftEffect,
} from '../../../types';
import getDisplacedBy from '../../get-displaced-by';
import { emptyGroups, noDisplacedBy } from '../../no-impact';
import getPageBorderBoxCenter from '../../get-center-from-impact/get-page-border-box-center';
import isTotallyVisibleInNewLocation from '../move-to-next-place/is-totally-visible-in-new-location';
import { addPlaceholder } from '../../droppable/with-placeholder';
import isHomeOf from '../../droppable/is-home-of';
import calculateReorderImpact from '../../calculate-drag-impact/calculate-reorder-impact';

type Args = {|
  previousPageBorderBoxCenter: Position,
  moveRelativeTo: ?DraggableDimension,
  insideDestination: DraggableDimension[],
  draggable: DraggableDimension,
  draggables: DraggableDimensionMap,
  destination: DroppableDimension,
  viewport: Viewport,
  afterCritical: LiftEffect,
|};

export default ({
  previousPageBorderBoxCenter,
  moveRelativeTo,
  insideDestination,
  draggable,
  draggables,
  destination,
  viewport,
  afterCritical,
}: Args): ?DragImpact => {
  if (!moveRelativeTo) {
    // Draggables available, but none are candidates for movement
    if (insideDestination.length) {
      return null;
    }

    // Try move to top of empty list if it is visible
    const proposed: DragImpact = {
      displaced: emptyGroups,
      displacedBy: noDisplacedBy,
      at: {
        type: 'REORDER',
        destination: {
          droppableId: destination.descriptor.id,
          index: 0,
        },
      },
    };
    const proposedPageBorderBoxCenter: Position = getPageBorderBoxCenter({
      impact: proposed,
      draggable,
      droppable: destination,
      draggables,
      afterCritical,
    });

    // need to add room for a placeholder in a foreign list
    const withPlaceholder: DroppableDimension = isHomeOf(draggable, destination)
      ? destination
      : addPlaceholder(destination, draggable, draggables);

    const isVisibleInNewLocation: boolean = isTotallyVisibleInNewLocation({
      draggable,
      destination: withPlaceholder,
      newPageBorderBoxCenter: proposedPageBorderBoxCenter,
      viewport: viewport.frame,
      // already taken into account by getPageBorderBoxCenter
      withDroppableDisplacement: false,
      onlyOnMainAxis: true,
    });

    return isVisibleInNewLocation ? proposed : null;
  }

  const isGoingBeforeTarget: boolean = Boolean(
    // Using <= as we optimise slightly for moving before items in a new list
    // This is nicer in lists with fixed height items
    previousPageBorderBoxCenter[destination.axis.line] <=
      moveRelativeTo.page.borderBox.center[destination.axis.line],
  );

  const proposedIndex: number = (() => {
    const relativeTo: number = moveRelativeTo.descriptor.index;

    if (moveRelativeTo.descriptor.id === draggable.descriptor.id) {
      return relativeTo;
    }

    if (isGoingBeforeTarget) {
      return relativeTo;
    }

    return relativeTo + 1;
  })();

  const displacedBy: DisplacedBy = getDisplacedBy(
    destination.axis,
    draggable.displaceBy,
  );

  return calculateReorderImpact({
    draggable,
    insideDestination,
    destination,
    viewport,
    displacedBy,
    // last groups won't be relevant
    last: emptyGroups,
    index: proposedIndex,
  });
};
