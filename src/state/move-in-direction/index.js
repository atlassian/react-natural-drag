// @flow
import type { Position } from 'css-box-model';
import type { PublicResult } from './move-in-direction-types';
import type {
  DroppableId,
  DraggingState,
  Direction,
  DroppableDimension,
  DraggableDimension,
  DroppableDimensionMap,
  DragImpact,
} from '../../types';
import moveToNextPlace from './move-to-next-place';
import moveAxis from './move-axis';
import whatIsDraggedOver from '../droppable/what-is-dragged-over';

type Args = {|
  state: DraggingState,
  type: 'MOVE_UP' | 'MOVE_RIGHT' | 'MOVE_DOWN' | 'MOVE_LEFT',
|};

const getDroppableOver = (
  impact: DragImpact,
  droppables: DroppableDimensionMap,
): ?DroppableDimension => {
  const id: ?DroppableId = whatIsDraggedOver(impact);
  return id ? droppables[id] : null;
};

export default ({ state, type }: Args): ?PublicResult => {
  const isActuallyOver: ?DroppableDimension = getDroppableOver(
    state.impact,
    state.dimensions.droppables,
  );
  const isMainAxisMovementAllowed: boolean = Boolean(isActuallyOver);
  const home: DroppableDimension =
    state.dimensions.droppables[state.critical.droppable.id];
  // use home when not actually over a droppable (can happen when move is disabled)
  const isOver: DroppableDimension = isActuallyOver || home;

  const direction: Direction = isOver.axis.direction;
  const isMovingOnMainAxis: boolean =
    (direction === 'vertical' &&
      (type === 'MOVE_UP' || type === 'MOVE_DOWN')) ||
    (direction === 'horizontal' &&
      (type === 'MOVE_LEFT' || type === 'MOVE_RIGHT'));

  // This movement is not permitted right now
  if (isMovingOnMainAxis && !isMainAxisMovementAllowed) {
    return null;
  }

  const isMovingForward: boolean =
    type === 'MOVE_DOWN' || type === 'MOVE_RIGHT';

  const draggable: DraggableDimension =
    state.dimensions.draggables[state.critical.draggable.id];
  const previousPageBorderBoxCenter: Position =
    state.current.page.borderBoxCenter;
  const { draggables, droppables } = state.dimensions;

  if (isMovingOnMainAxis) {
    const moveToNextPlaceResult = moveToNextPlace({
      isMovingForward,
      previousPageBorderBoxCenter,
      draggable,
      destination: isOver,
      draggables,
      viewport: state.viewport,
      previousClientSelection: state.current.client.selection,
      previousImpact: state.impact,
      afterCritical: state.afterCritical,
    });
    if (moveToNextPlaceResult) {
      return moveToNextPlaceResult;
    }
  }

  return moveAxis({
    isMovingOnMainAxis,
    isMovingForward,
    previousPageBorderBoxCenter,
    draggable,
    isOver,
    draggables,
    droppables,
    viewport: state.viewport,
    afterCritical: state.afterCritical,
  });
};
