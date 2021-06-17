// @flow
import React from 'react';
import type { DraggableId } from '../../types';
import type { PublicOwnProps, PrivateOwnProps } from './draggable-types';
import ConnectedDraggable from './connected-draggable';
import useRequiredContext from '../use-required-context';
import DroppableContext, {
  type DroppableContextValue,
} from '../context/droppable-context';
import { defaultTimeForLongPress } from '../use-sensor-marshal/sensors/use-touch-sensor';

// We can use this to render a draggable with more control
// It is used by a Droppable to render a clone
export function PrivateDraggable(props: PrivateOwnProps) {
  const droppableContext: DroppableContextValue = useRequiredContext(
    DroppableContext,
  );
  // The droppable can render a clone of the draggable item.
  // In that case we unmount the existing dragging item
  const isUsingCloneFor: ?DraggableId = droppableContext.isUsingCloneFor;
  if (isUsingCloneFor === props.draggableId && !props.isClone) {
    return null;
  }

  return <ConnectedDraggable {...props} />;
}

// What we give to consumers
export function PublicDraggable(props: PublicOwnProps) {
  // default values for props
  const isEnabled: boolean =
    typeof props.isDragDisabled === 'boolean' ? !props.isDragDisabled : true;
  const canDragInteractiveElements: boolean = Boolean(
    props.disableInteractiveElementBlocking,
  );
  const shouldRespectForcePress: boolean = Boolean(
    props.shouldRespectForcePress,
  );
  const timeForLongPress: number =
    props.timeForLongPress !== undefined
      ? Number(props.timeForLongPress)
      : defaultTimeForLongPress;

  return (
    <PrivateDraggable
      {...props}
      isClone={false}
      isEnabled={isEnabled}
      canDragInteractiveElements={canDragInteractiveElements}
      shouldRespectForcePress={shouldRespectForcePress}
      timeForLongPress={timeForLongPress}
    />
  );
}
