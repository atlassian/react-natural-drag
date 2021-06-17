// @flow
import { type Position, type Rect } from 'css-box-model';
import { invariant } from '../../../invariant';
import { closest } from '../../position';
import isWithin from '../../is-within';
import { getCorners } from '../../spacing';
import isPartiallyVisibleThroughFrame from '../../visibility/is-partially-visible-through-frame';
import { toDroppableList } from '../../dimension-structures';
import type {
  Axis,
  DroppableDimension,
  DroppableDimensionMap,
  Viewport,
} from '../../../types';

type GetBestDroppableArgs = {|
  isMovingOnMainAxis?: boolean,
  isMovingForward: boolean,
  // the current position of the dragging item
  pageBorderBoxCenter: Position,
  // the home of the draggable
  source: DroppableDimension,
  // all the droppables in the system
  droppables: DroppableDimensionMap,
  viewport: Viewport,
|};

const getKnownActive = (droppable: DroppableDimension): Rect => {
  const rect: ?Rect = droppable.subject.active;

  invariant(rect, 'Cannot get clipped area from droppable');

  return rect;
};

export default ({
  isMovingOnMainAxis,
  isMovingForward,
  pageBorderBoxCenter,
  source,
  droppables,
  viewport,
}: GetBestDroppableArgs): ?DroppableDimension => {
  const active: ?Rect = source.subject.active;

  if (!active) {
    return null;
  }

  const axis: Axis = source.axis;

  const movementAxisStart = isMovingOnMainAxis
    ? axis.start
    : axis.crossAxisStart;
  const movementAxisEnd = isMovingOnMainAxis ? axis.end : axis.crossAxisEnd;
  const transverseAxisStart = isMovingOnMainAxis
    ? axis.crossAxisStart
    : axis.start;
  const transverseAxisEnd = isMovingOnMainAxis ? axis.crossAxisEnd : axis.end;
  const transverseAxisLine = isMovingOnMainAxis
    ? axis.crossAxisLine
    : axis.line;

  const isBetweenSourceClipped = isWithin(
    active[transverseAxisStart],
    active[transverseAxisEnd],
  );
  const candidates: DroppableDimension[] = toDroppableList(droppables)
    // Remove the source droppable from the list
    .filter((droppable: DroppableDimension): boolean => droppable !== source)
    // Remove any options that are not enabled
    .filter((droppable: DroppableDimension): boolean => droppable.isEnabled)
    // Remove any droppables that do not have a visible subject
    .filter((droppable: DroppableDimension): boolean =>
      Boolean(droppable.subject.active),
    )
    // Remove any that are not visible in the window
    .filter((droppable: DroppableDimension): boolean =>
      isPartiallyVisibleThroughFrame(viewport.frame)(getKnownActive(droppable)),
    )
    .filter((droppable: DroppableDimension): boolean => {
      const activeOfTarget: Rect = getKnownActive(droppable);

      // is the target in front of the source on the cross axis?
      if (isMovingForward) {
        return active[movementAxisEnd] < activeOfTarget[movementAxisEnd];
      }
      // is the target behind the source on the cross axis?
      return activeOfTarget[movementAxisStart] < active[movementAxisStart];
    })
    // Must have some overlap on the main axis
    .filter((droppable: DroppableDimension): boolean => {
      const activeOfTarget: Rect = getKnownActive(droppable);

      const isBetweenDestinationClipped = isWithin(
        activeOfTarget[transverseAxisStart],
        activeOfTarget[transverseAxisEnd],
      );

      return (
        isBetweenSourceClipped(activeOfTarget[transverseAxisStart]) ||
        isBetweenSourceClipped(activeOfTarget[transverseAxisEnd]) ||
        isBetweenDestinationClipped(active[transverseAxisStart]) ||
        isBetweenDestinationClipped(active[transverseAxisEnd])
      );
    })
    // Sort on the cross axis
    .sort((a: DroppableDimension, b: DroppableDimension) => {
      const first: number = getKnownActive(a)[movementAxisStart];
      const second: number = getKnownActive(b)[movementAxisStart];

      if (isMovingForward) {
        return first - second;
      }
      return second - first;
    })
    // Find the droppables that have the same cross axis value as the first item
    .filter(
      (
        droppable: DroppableDimension,
        index: number,
        array: DroppableDimension[],
      ): boolean =>
        getKnownActive(droppable)[movementAxisStart] ===
        getKnownActive(array[0])[movementAxisStart],
    );

  // no possible candidates
  if (!candidates.length) {
    return null;
  }

  // only one result - all done!
  if (candidates.length === 1) {
    return candidates[0];
  }

  // At this point we have a number of candidates that
  // all have the same axis.crossAxisStart value.

  // Check to see if the center position is within the size of a Droppable on the main axis
  const contains: DroppableDimension[] = candidates.filter(
    (droppable: DroppableDimension) => {
      const isWithinDroppable = isWithin(
        getKnownActive(droppable)[transverseAxisStart],
        getKnownActive(droppable)[transverseAxisEnd],
      );
      return isWithinDroppable(pageBorderBoxCenter[transverseAxisLine]);
    },
  );

  if (contains.length === 1) {
    return contains[0];
  }

  // The center point of the draggable falls on the boundary between two droppables
  if (contains.length > 1) {
    // sort on the main axis and choose the first
    return contains.sort(
      (a: DroppableDimension, b: DroppableDimension): number =>
        getKnownActive(a)[transverseAxisStart] -
        getKnownActive(b)[transverseAxisStart],
    )[0];
  }

  // The center is not contained within any droppable
  // 1. Find the candidate that has the closest corner
  // 2. If there is a tie - choose the one that is first on the main axis
  return candidates.sort(
    (a: DroppableDimension, b: DroppableDimension): number => {
      const first = closest(pageBorderBoxCenter, getCorners(getKnownActive(a)));
      const second = closest(
        pageBorderBoxCenter,
        getCorners(getKnownActive(b)),
      );

      // if the distances are not equal - choose the shortest
      if (first !== second) {
        return first - second;
      }

      // They both have the same distance -
      // choose the one that is first on the main axis
      return (
        getKnownActive(a)[transverseAxisStart] -
        getKnownActive(b)[transverseAxisStart]
      );
    },
  )[0];
};
