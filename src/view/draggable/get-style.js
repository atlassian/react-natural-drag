// @flow
import type { BoxModel } from 'css-box-model';
import { combine, transforms, transitions } from '../../animation';
import type { DraggableDimension } from '../../types';
import type {
  DraggingStyle,
  NotDraggingStyle,
  ZIndexOptions,
  DropAnimation,
  SecondaryMapProps,
  DraggingMapProps,
  DraggableStyle,
  MappedProps,
} from './draggable-types';

export const zIndexOptions: ZIndexOptions = {
  dragging: 5000,
  dropAnimating: 4500,
};

const getDraggingTransition = (
  shouldAnimateDragMovement: boolean,
  dropping: ?DropAnimation,
): string => {
  if (dropping) {
    return transitions.drop(dropping.duration);
  }
  if (shouldAnimateDragMovement) {
    return transitions.snap;
  }
  return transitions.fluid;
};

const getDraggingOpacity = (
  isCombining: boolean,
  isDropAnimating: boolean,
): ?number => {
  // if not combining: no not impact opacity
  if (!isCombining) {
    return null;
  }

  return isDropAnimating ? combine.opacity.drop : combine.opacity.combining;
};

const getShouldDraggingAnimate = (dragging: DraggingMapProps): boolean => {
  if (dragging.forceShouldAnimate != null) {
    return dragging.forceShouldAnimate;
  }
  return dragging.mode === 'SNAP';
};

function getDraggingStyle(dragging: DraggingMapProps): DraggingStyle {
  const dimension: DraggableDimension = dragging.dimension;
  const box: BoxModel = dimension.client;
  const { offset, combineWith, dropping } = dragging;

  const isCombining: boolean = Boolean(combineWith);

  const shouldAnimate: boolean = getShouldDraggingAnimate(dragging);
  const isDropAnimating: boolean = Boolean(dropping);

  const transform: ?string = isDropAnimating
    ? transforms.drop(offset, isCombining)
    : transforms.moveTo(offset);

  const style: DraggingStyle = {
    // ## Placement
    position: 'fixed',
    // As we are applying the margins we need to align to the start of the marginBox
    top: box.marginBox.top,
    left: box.marginBox.left,

    // ## Sizing
    // Locking these down as pulling the node out of the DOM could cause it to change size
    boxSizing: 'border-box',
    width: box.borderBox.width,
    height: box.borderBox.height,

    // ## Movement
    // Opting out of the standard css transition for the dragging item
    transition: getDraggingTransition(shouldAnimate, dropping),
    transform,
    opacity: getDraggingOpacity(isCombining, isDropAnimating),
    // ## Layering
    zIndex: isDropAnimating
      ? zIndexOptions.dropAnimating
      : zIndexOptions.dragging,

    // ## Blocking any pointer events on the dragging or dropping item
    // global styles on cover while dragging
    pointerEvents: 'none',
  };
  return style;
}

function getSecondaryStyle(secondary: SecondaryMapProps): NotDraggingStyle {
  return {
    transform: transforms.moveTo(secondary.offset),
    // transition style is applied in the head or stylesInsertionPoint
    transition: secondary.shouldAnimateDisplacement ? null : 'none',
  };
}

export default function getStyle(mapped: MappedProps): DraggableStyle {
  return mapped.type === 'DRAGGING'
    ? getDraggingStyle(mapped)
    : getSecondaryStyle(mapped);
}
