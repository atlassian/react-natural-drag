// @flow
import { type Position, type Rect } from 'css-box-model';
import type {
  DroppableDimension,
  DroppableDimensionMap,
  DroppableId,
  DraggableDimension,
  Axis,
} from '../types';
import { getDroppableList } from './dimension-structures';
import isPositionInFrame from './visibility/is-position-in-frame';
import { distance, patch } from './position';
import isWithin from './is-within';

// https://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other
// https://silentmatt.com/rectangle-intersection/
function getHasOverlap(first: Rect, second: Rect): boolean {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

type Args = {|
  pageBorderBox: Rect,
  draggable: DraggableDimension,
  droppables: DroppableDimensionMap,
|};

type WithDistance = {|
  distance: number,
  id: DroppableId,
|};

type GetFurthestArgs = {|
  pageBorderBox: Rect,
  draggable: DraggableDimension,
  candidates: DroppableDimension[],
|};

function getFurthestAway({
  pageBorderBox,
  draggable,
  candidates,
}: GetFurthestArgs): ?DroppableId {
  // We are not comparing the center of the home list with the target list as it would
  // give preference to giant lists

  // We are measuring the distance from where the draggable started
  // to where it is *hitting* the candidate
  // Note: The hit point might technically not be in the bounds of the candidate

  const startCenter: Position = draggable.page.borderBox.center;
  const sorted: WithDistance[] = candidates
    .map((candidate: DroppableDimension): WithDistance => {
      const axis: Axis = candidate.axis;
      const target: Position = patch(
        candidate.axis.line,
        // use the current center of the dragging item on the main axis
        pageBorderBox.center[axis.line],
        // use the center of the list on the cross axis
        candidate.page.borderBox.center[axis.crossAxisLine],
      );

      return {
        id: candidate.descriptor.id,
        distance: distance(startCenter, target),
      };
    })
    // largest value will be first
    .sort((a: WithDistance, b: WithDistance) => b.distance - a.distance);

  // just being safe
  return sorted[0] ? sorted[0].id : null;
}

export default function getDroppableOver({
  pageBorderBox,
  draggable,
  droppables,
}: Args): ?DroppableId {
  // We know at this point that some overlap has to exist
  const candidates: DroppableDimension[] = getDroppableList(
    draggable,
    pageBorderBox,
    droppables,
  ).filter((item: DroppableDimension): boolean => {
    // Cannot be a candidate when disabled
    if (!item.isEnabled) {
      return false;
    }

    // Cannot be a candidate when there is no visible area
    const active: ?Rect = item.subject.active;
    if (!active) {
      return false;
    }

    // Cannot be a candidate when dragging item is not over the droppable at all
    if (!getHasOverlap(pageBorderBox, active)) {
      return false;
    }

    // 1. Candidate if the center position is over a droppable
    if (isPositionInFrame(active)(pageBorderBox.center)) {
      return true;
    }

    // 2. Candidate if an edge is over the cross axis half way point
    // 3. Candidate if dragging item is totally over droppable on cross axis

    const axis: Axis = item.axis;
    const childCenter: number = active.center[axis.crossAxisLine];
    const crossAxisStart: number = pageBorderBox[axis.crossAxisStart];
    const crossAxisEnd: number = pageBorderBox[axis.crossAxisEnd];

    const isContained = isWithin(
      active[axis.crossAxisStart],
      active[axis.crossAxisEnd],
    );

    const isStartContained: boolean = isContained(crossAxisStart);
    const isEndContained: boolean = isContained(crossAxisEnd);

    // Dragging item is totally covering the active area
    if (!isStartContained && !isEndContained) {
      return true;
    }

    /**
     * edges must go beyond the center line in order to avoid
     * cases were both conditions are satisfied.
     */
    if (isStartContained) {
      return crossAxisStart < childCenter;
    }

    return crossAxisEnd > childCenter;
  });

  if (!candidates.length) {
    return null;
  }

  // Only one candidate - use that!
  if (candidates.length === 1) {
    return candidates[0].descriptor.id;
  }

  // Multiple options returned
  // Should only occur with really large items
  // Going to use fallback: distance from home
  return getFurthestAway({
    pageBorderBox,
    draggable,
    candidates,
  });
}
