// @flow
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useCallback } from 'use-memo-one';
import type { Spacing } from 'css-box-model';
import type {
  Placeholder as PlaceholderType,
  InOutAnimationMode,
  ContextId,
} from '../../types';
import { transitions } from '../../animation';
import { noSpacing } from '../../state/spacing';

function noop() {}

export type PlaceholderStyle = {|
  display: string,
  boxSizing: 'border-box',
  width: number,
  height: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number,
  flexShrink: '0',
  flexGrow: '0',
  pointerEvents: 'none',
  transition: ?string,
|};
export type Props = {|
  placeholder: PlaceholderType,
  animate: InOutAnimationMode,
  onClose: () => void,
  innerRef?: () => ?HTMLElement,
  onTransitionEnd: () => void,
  contextId: ContextId,
|};

type Size = {|
  width: number,
  height: number,
  // Need to animate in/out animation as well as size
  margin: Spacing,
|};

type HelperArgs = {|
  isAnimatingOpenOnMount: boolean,
  placeholder: PlaceholderType,
  animate: InOutAnimationMode,
|};

const empty: Size = {
  width: 0,
  height: 0,
  margin: noSpacing,
};

const getSize = ({
  isAnimatingOpenOnMount,
  placeholder,
  animate,
}: HelperArgs): Size => {
  if (isAnimatingOpenOnMount) {
    return empty;
  }

  if (animate === 'close') {
    return empty;
  }

  return {
    height: placeholder.client.borderBox.height,
    width: placeholder.client.borderBox.width,
    margin: placeholder.client.margin,
  };
};

const getStyle = ({
  isAnimatingOpenOnMount,
  placeholder,
  animate,
}: HelperArgs): PlaceholderStyle => {
  const size: Size = getSize({ isAnimatingOpenOnMount, placeholder, animate });

  return {
    display: placeholder.display,
    // ## Recreating the box model
    // We created the borderBox and then apply the margins directly
    // this is to maintain any margin collapsing behaviour

    // creating borderBox
    // background: 'green',
    boxSizing: 'border-box',
    width: size.width,
    height: size.height,
    // creating marginBox
    marginTop: size.margin.top,
    marginRight: size.margin.right,
    marginBottom: size.margin.bottom,
    marginLeft: size.margin.left,

    // ## Avoiding collapsing
    // Avoiding the collapsing or growing of this element when pushed by flex child siblings.
    // We have already taken a snapshot the current dimensions we do not want this element
    // to recalculate its dimensions
    // It is okay for these properties to be applied on elements that are not flex children
    flexShrink: '0',
    flexGrow: '0',
    // Just a little performance optimisation: avoiding the browser needing
    // to worry about pointer events for this element
    pointerEvents: 'none',

    // Animate the placeholder size and margin
    transition: animate !== 'none' ? transitions.placeholder : null,
  };
};

function Placeholder(props: Props): React.Node {
  const animateOpenTimerRef = useRef<?TimeoutID>(null);

  const tryClearAnimateOpenTimer = useCallback(() => {
    if (!animateOpenTimerRef.current) {
      return;
    }
    clearTimeout(animateOpenTimerRef.current);
    animateOpenTimerRef.current = null;
  }, []);

  const { animate, onTransitionEnd, onClose, contextId } = props;
  const [isAnimatingOpenOnMount, setIsAnimatingOpenOnMount] = useState<boolean>(
    props.animate === 'open',
  );

  // Will run after a render is flushed
  // Still need to wait a timeout to ensure that the
  // update is completely applied to the DOM
  useEffect(() => {
    // No need to do anything
    if (!isAnimatingOpenOnMount) {
      return noop;
    }

    // might need to clear the timer
    if (animate !== 'open') {
      tryClearAnimateOpenTimer();
      setIsAnimatingOpenOnMount(false);
      return noop;
    }

    // timer already pending
    if (animateOpenTimerRef.current) {
      return noop;
    }

    animateOpenTimerRef.current = setTimeout(() => {
      animateOpenTimerRef.current = null;
      setIsAnimatingOpenOnMount(false);
    });

    // clear the timer if needed
    return tryClearAnimateOpenTimer;
  }, [animate, isAnimatingOpenOnMount, tryClearAnimateOpenTimer]);

  const onSizeChangeEnd = useCallback(
    (event: TransitionEvent) => {
      // We transition height, width and margin
      // each of those transitions will independently call this callback
      // Because they all have the same duration we can just respond to one of them
      // 'height' was chosen for no particular reason :D
      if (event.propertyName !== 'height') {
        return;
      }

      onTransitionEnd();

      if (animate === 'close') {
        onClose();
      }
    },
    [animate, onClose, onTransitionEnd],
  );

  const style: PlaceholderStyle = getStyle({
    isAnimatingOpenOnMount,
    animate: props.animate,
    placeholder: props.placeholder,
  });

  return React.createElement(props.placeholder.tagName, {
    style,
    'data-rbd-placeholder-context-id': contextId,
    onTransitionEnd: onSizeChangeEnd,
    ref: props.innerRef,
  });
}

export default React.memo<Props>(Placeholder);
// enzyme does not work well with memo, so exporting the non-memo version
export const WithoutMemo = Placeholder;
