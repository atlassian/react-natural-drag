// @flow
import ReactDOM from 'react-dom';
import { useMemo, useCallback } from 'use-memo-one';
import React, { useRef, useContext, type Node } from 'react';
import { invariant } from '../../invariant';
import type { DraggableId } from '../../types';
import type { Props, Provided } from './droppable-types';
import useDroppablePublisher from '../use-droppable-publisher';
import Placeholder from '../placeholder';
import AppContext, { type AppContextValue } from '../context/app-context';
import DroppableContext, {
  type DroppableContextValue,
} from '../context/droppable-context';
// import useAnimateInOut from '../use-animate-in-out/use-animate-in-out';
import getMaxWindowScroll from '../window/get-max-window-scroll';
import useValidation from './use-validation';
import type {
  StateSnapshot as DraggableStateSnapshot,
  Provided as DraggableProvided,
} from '../draggable/draggable-types';
import AnimateInOut, {
  type AnimateProvided,
} from '../animate-in-out/animate-in-out';
import { PrivateDraggable } from '../draggable/draggable-api';
import { defaultTimeForLongPress } from '../use-sensor-marshal/sensors/use-touch-sensor';

export default function Droppable(props: Props) {
  const appContext: ?AppContextValue = useContext<?AppContextValue>(AppContext);
  invariant(appContext, 'Could not find app context');
  const { contextId, isMovementAllowed } = appContext;
  const droppableRef = useRef<?HTMLElement>(null);
  const placeholderRef = useRef<?HTMLElement>(null);

  const {
    // own props
    children,
    droppableId,
    type,
    mode,
    direction,
    ignoreContainerClipping,
    isDropDisabled,
    isCombineEnabled,
    // map props
    snapshot,
    useClone,
    // dispatch props
    updateViewportMaxScroll,

    // clone (ownProps)
    getContainerForClone,
  } = props;

  const getDroppableRef = useCallback(
    (): ?HTMLElement => droppableRef.current,
    [],
  );
  const setDroppableRef = useCallback((value: ?HTMLElement) => {
    droppableRef.current = value;
  }, []);
  const getPlaceholderRef = useCallback(
    (): ?HTMLElement => placeholderRef.current,
    [],
  );
  const setPlaceholderRef = useCallback((value: ?HTMLElement) => {
    placeholderRef.current = value;
  }, []);

  useValidation({
    props,
    getDroppableRef,
    getPlaceholderRef,
  });

  const onPlaceholderTransitionEnd = useCallback(() => {
    // A placeholder change can impact the window's max scroll
    if (isMovementAllowed()) {
      updateViewportMaxScroll({ maxScroll: getMaxWindowScroll() });
    }
  }, [isMovementAllowed, updateViewportMaxScroll]);

  useDroppablePublisher({
    droppableId,
    type,
    mode,
    direction,
    isDropDisabled,
    isCombineEnabled,
    ignoreContainerClipping,
    getDroppableRef,
  });

  const placeholder: Node = (
    <AnimateInOut
      on={props.placeholder}
      shouldAnimate={props.shouldAnimatePlaceholder}
    >
      {({ onClose, data, animate }: AnimateProvided) => (
        <Placeholder
          placeholder={(data: any)}
          onClose={onClose}
          innerRef={setPlaceholderRef}
          animate={animate}
          contextId={contextId}
          onTransitionEnd={onPlaceholderTransitionEnd}
        />
      )}
    </AnimateInOut>
  );

  const provided: Provided = useMemo(
    (): Provided => ({
      innerRef: setDroppableRef,
      placeholder,
      droppableProps: {
        'data-rbd-droppable-id': droppableId,
        'data-rbd-droppable-context-id': contextId,
      },
    }),
    [contextId, droppableId, placeholder, setDroppableRef],
  );

  const isUsingCloneFor: ?DraggableId = useClone
    ? useClone.dragging.draggableId
    : null;

  const droppableContext: ?DroppableContextValue = useMemo(
    () => ({
      droppableId,
      type,
      isUsingCloneFor,
    }),
    [droppableId, isUsingCloneFor, type],
  );

  function getClone(): ?Node {
    if (!useClone) {
      return null;
    }
    const { dragging, render } = useClone;

    const node: Node = (
      <PrivateDraggable
        draggableId={dragging.draggableId}
        index={dragging.source.index}
        isClone
        isEnabled
        // not important as drag has already started
        shouldRespectForcePress={false}
        timeForLongPress={defaultTimeForLongPress}
        canDragInteractiveElements
      >
        {(
          draggableProvided: DraggableProvided,
          draggableSnapshot: DraggableStateSnapshot,
        ) => render(draggableProvided, draggableSnapshot, dragging)}
      </PrivateDraggable>
    );

    return ReactDOM.createPortal(node, getContainerForClone());
  }

  return (
    <DroppableContext.Provider value={droppableContext}>
      {children(provided, snapshot)}
      {getClone()}
    </DroppableContext.Provider>
  );
}
