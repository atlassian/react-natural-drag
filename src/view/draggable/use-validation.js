// @flow
import { useRef } from 'react';
import { invariant } from '../../invariant';
import { isInteger } from '../../native-with-fallback';
import type { DraggableId, ContextId } from '../../types';
import type { Props } from './draggable-types';
import checkIsValidInnerRef from '../check-is-valid-inner-ref';
import findDragHandle from '../get-elements/find-drag-handle';
import useDevSetupWarning from '../use-dev-setup-warning';
import useDev from '../use-dev';

export function useValidation(
  props: Props,
  contextId: ContextId,
  getRef: () => ?HTMLElement,
) {
  // running after every update in development
  useDevSetupWarning(() => {
    function prefix(id: DraggableId): string {
      return `Draggable[id: ${id}]: `;
    }

    // wrapping entire block for better minification
    const id: ?DraggableId = props.draggableId;
    invariant(id, 'Draggable requires a draggableId');
    invariant(
      typeof id === 'string',
      `Draggable requires a [string] draggableId.
      Provided: [type: ${typeof id}] (value: ${id})`,
    );

    invariant(
      isInteger(props.index),
      `${prefix(id)} requires an integer index prop`,
    );

    if (props.mapped.type === 'DRAGGING') {
      return;
    }

    // Checking provided ref (only when not dragging as it might be removed)
    checkIsValidInnerRef(getRef());

    // Checking that drag handle is provided
    // Only running check when enabled.
    // When not enabled there is no drag handle props
    if (props.isEnabled) {
      invariant(
        findDragHandle(contextId, id, getRef()),
        `${prefix(id)} Unable to find drag handle`,
      );
    }
  });
}

// we expect isClone not to change for entire component's life
export function useClonePropValidation(isClone: boolean) {
  useDev(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initialRef = useRef<boolean>(isClone);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDevSetupWarning(() => {
      invariant(
        isClone === initialRef.current,
        'Draggable isClone prop value changed during component life',
      );
    }, [isClone]);
  });
}
