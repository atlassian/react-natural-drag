// @flow
import { useRef } from 'react';
import { useCallback, useMemo } from 'use-memo-one';
import type { Position } from 'css-box-model';
import { invariant } from '../../../invariant';
import type {
  PreDragActions,
  FluidDragActions,
  DraggableId,
  SensorAPI,
  DraggableOptions,
} from '../../../types';
import type {
  EventBinding,
  EventOptions,
} from '../../event-bindings/event-types';
import bindEvents from '../../event-bindings/bind-events';
import * as keyCodes from '../../key-codes';
import preventStandardKeyEvents from './util/prevent-standard-key-events';
import supportedPageVisibilityEventName from './util/supported-page-visibility-event-name';
import useLayoutEffect from '../../use-isomorphic-layout-effect';
import { noop } from '../../../empty';

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
export const primaryButton: number = 0;
export const sloppyClickThreshold: number = 5;

function isSloppyClickThresholdExceeded(
  original: Position,
  current: Position,
): boolean {
  return (
    Math.abs(current.x - original.x) >= sloppyClickThreshold ||
    Math.abs(current.y - original.y) >= sloppyClickThreshold
  );
}
type Idle = {|
  type: 'IDLE',
|};

type Pending = {|
  type: 'PENDING',
  point: Position,
  actions: PreDragActions,
|};

type Dragging = {|
  type: 'DRAGGING',
  actions: FluidDragActions,
|};

type Phase = Idle | Pending | Dragging;

const idle: Idle = { type: 'IDLE' };

type GetCaptureArgs = {|
  cancel: () => void,
  completed: () => void,
  getPhase: () => Phase,
  setPhase: (phase: Phase) => void,
|};

function getCaptureBindings({
  cancel,
  completed,
  getPhase,
  setPhase,
}: GetCaptureArgs): EventBinding[] {
  return [
    {
      eventName: 'mousemove',
      fn: (event: MouseEvent) => {
        const { button, clientX, clientY } = event;
        if (button !== primaryButton) {
          return;
        }

        const point: Position = {
          x: clientX,
          y: clientY,
        };

        const phase: Phase = getPhase();

        // Already dragging
        if (phase.type === 'DRAGGING') {
          // preventing default as we are using this event
          event.preventDefault();
          phase.actions.move(point);
          return;
        }

        // There should be a pending drag at this point
        invariant(phase.type === 'PENDING', 'Cannot be IDLE');
        const pending: Position = phase.point;

        // threshold not yet exceeded
        if (!isSloppyClickThresholdExceeded(pending, point)) {
          return;
        }

        // preventing default as we are using this event
        event.preventDefault();

        // Lifting at the current point to prevent the draggable item from
        // jumping by the sloppyClickThreshold
        const actions: FluidDragActions = phase.actions.fluidLift(point);

        setPhase({
          type: 'DRAGGING',
          actions,
        });
      },
    },
    {
      eventName: 'mouseup',
      fn: (event: MouseEvent) => {
        const phase: Phase = getPhase();

        if (phase.type !== 'DRAGGING') {
          cancel();
          return;
        }

        // preventing default as we are using this event
        event.preventDefault();
        phase.actions.drop({ shouldBlockNextClick: true });
        completed();
      },
    },
    {
      eventName: 'mousedown',
      fn: (event: MouseEvent) => {
        // this can happen during a drag when the user clicks a button
        // other than the primary mouse button
        if (getPhase().type === 'DRAGGING') {
          event.preventDefault();
        }

        cancel();
      },
    },
    {
      eventName: 'keydown',
      fn: (event: KeyboardEvent) => {
        const phase: Phase = getPhase();
        // Abort if any keystrokes while a drag is pending
        if (phase.type === 'PENDING') {
          cancel();
          return;
        }

        // cancelling a drag
        if (event.keyCode === keyCodes.escape) {
          event.preventDefault();
          cancel();
          return;
        }

        preventStandardKeyEvents(event);
      },
    },
    {
      eventName: 'resize',
      fn: cancel,
    },
    {
      eventName: 'scroll',
      // kill a pending drag if there is a window scroll
      options: { passive: true, capture: false },
      fn: () => {
        if (getPhase().type === 'PENDING') {
          cancel();
        }
      },
    },

    // Need to opt out of dragging if the user is a force press
    // Only for safari which has decided to introduce its own custom way of doing things
    // https://developer.apple.com/library/content/documentation/AppleApplications/Conceptual/SafariJSProgTopics/RespondingtoForceTouchEventsfromJavaScript.html
    {
      eventName: 'webkitmouseforcedown',
      // it is considered a indirect cancel so we do not
      // prevent default in any situation.
      fn: (event: Event) => {
        const phase: Phase = getPhase();
        invariant(phase.type !== 'IDLE', 'Unexpected phase');

        if (phase.actions.shouldRespectForcePress()) {
          cancel();
          return;
        }

        // This technically doesn't do anything.
        // It won't do anything if `webkitmouseforcewillbegin` is prevented.
        // But it is a good signal that we want to opt out of this

        event.preventDefault();
      },
    },
    // Cancel on page visibility change
    {
      eventName: supportedPageVisibilityEventName,
      fn: cancel,
    },
  ];
}

export default function useMouseSensor(api: SensorAPI) {
  const phaseRef = useRef<Phase>(idle);
  const unbindEventsRef = useRef<() => void>(noop);

  const startCaptureBinding: EventBinding = useMemo(
    () => ({
      eventName: 'mousedown',
      fn: function onMouseDown(event: MouseEvent) {
        // Event already used
        if (event.defaultPrevented) {
          return;
        }
        // only starting a drag if dragging with the primary mouse button
        if (event.button !== primaryButton) {
          return;
        }

        // Do not start a drag if any modifier key is pressed
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
          return;
        }

        const draggableId: ?DraggableId = api.findClosestDraggableId(event);

        if (!draggableId) {
          return;
        }

        const actions: ?PreDragActions = api.tryGetLock(
          draggableId,
          // stop is defined later
          // eslint-disable-next-line no-use-before-define
          stop,
          { sourceEvent: event },
        );

        if (!actions) {
          return;
        }

        const point: Position = {
          x: event.clientX,
          y: event.clientY,
        };

        // unbind this listener
        unbindEventsRef.current();
        // using this function before it is defined as their is a circular usage pattern
        // eslint-disable-next-line no-use-before-define
        startPendingDrag(actions, point);
      },
    }),
    // not including startPendingDrag as it is not defined initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api],
  );

  const preventForcePressBinding: EventBinding = useMemo(
    () => ({
      eventName: 'webkitmouseforcewillbegin',
      fn: (event: Event) => {
        if (event.defaultPrevented) {
          return;
        }

        const id: ?DraggableId = api.findClosestDraggableId(event);

        if (!id) {
          return;
        }

        const options: ?DraggableOptions = api.findOptionsForDraggable(id);

        if (!options) {
          return;
        }

        if (options.shouldRespectForcePress) {
          return;
        }

        if (!api.canGetLock(id)) {
          return;
        }

        event.preventDefault();
      },
    }),
    [api],
  );

  const listenForCapture = useCallback(
    function listenForCapture() {
      const options: EventOptions = {
        passive: false,
        capture: true,
      };

      unbindEventsRef.current = bindEvents(
        window,
        [preventForcePressBinding, startCaptureBinding],
        options,
      );
    },
    [preventForcePressBinding, startCaptureBinding],
  );

  const stop = useCallback(() => {
    const current: Phase = phaseRef.current;
    if (current.type === 'IDLE') {
      return;
    }

    phaseRef.current = idle;
    unbindEventsRef.current();

    listenForCapture();
  }, [listenForCapture]);

  const cancel = useCallback(() => {
    const phase: Phase = phaseRef.current;
    stop();
    if (phase.type === 'DRAGGING') {
      phase.actions.cancel({ shouldBlockNextClick: true });
    }
    if (phase.type === 'PENDING') {
      phase.actions.abort();
    }
  }, [stop]);

  const bindCapturingEvents = useCallback(
    function bindCapturingEvents() {
      const options = { capture: true, passive: false };
      const bindings: EventBinding[] = getCaptureBindings({
        cancel,
        completed: stop,
        getPhase: () => phaseRef.current,
        setPhase: (phase: Phase) => {
          phaseRef.current = phase;
        },
      });

      unbindEventsRef.current = bindEvents(window, bindings, options);
    },
    [cancel, stop],
  );

  const startPendingDrag = useCallback(
    function startPendingDrag(actions: PreDragActions, point: Position) {
      invariant(
        phaseRef.current.type === 'IDLE',
        'Expected to move from IDLE to PENDING drag',
      );
      phaseRef.current = {
        type: 'PENDING',
        point,
        actions,
      };
      bindCapturingEvents();
    },
    [bindCapturingEvents],
  );

  useLayoutEffect(
    function mount() {
      listenForCapture();

      // kill any pending window events when unmounting
      return function unmount() {
        unbindEventsRef.current();
      };
    },
    [listenForCapture],
  );
}
