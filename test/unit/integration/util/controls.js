// @flow
import { fireEvent, act } from '@testing-library/react';
import { sloppyClickThreshold } from '../../../../src/view/use-sensor-marshal/sensors/use-mouse-sensor';
import { defaultTimeForLongPress } from '../../../../src/view/use-sensor-marshal/sensors/use-touch-sensor';
import * as keyCodes from '../../../../src/view/key-codes';

export type Control = {|
  name: string,
  preLift: (handle: HTMLElement) => void,
  lift: (handle: HTMLElement) => void,
  move: (handle: HTMLElement) => void,
  drop: (handle: HTMLElement) => void,
  cancel: (handle: HTMLElement) => void,
|};

export function simpleLift(control: Control, handle: HTMLElement) {
  control.preLift(handle);
  control.lift(handle);
}

export function getTransitionEnd(propertyName?: string = 'transform'): Event {
  const event: Event = new Event('transitionend', {
    bubbles: true,
    cancelable: true,
  });
  // cheating and adding property to event as TransitionEvent constructor does not exist
  // $ExpectError - being amazing
  event.propertyName = propertyName;
  return event;
}
export const mouse: Control = {
  name: 'mouse',
  preLift: (handle: HTMLElement) => {
    fireEvent.mouseDown(handle);
  },
  lift: (handle: HTMLElement) => {
    fireEvent.mouseMove(handle, { clientX: 0, clientY: sloppyClickThreshold });
  },
  move: (handle: HTMLElement) => {
    fireEvent.mouseMove(handle, {
      clientX: 0,
      clientY: sloppyClickThreshold + 1,
    });
    // movements are throttled by raf
    act(() => {
      requestAnimationFrame.step();
    });
  },
  drop: (handle: HTMLElement) => {
    fireEvent.mouseUp(handle);
    fireEvent(handle, getTransitionEnd());
  },
  cancel: (handle: HTMLElement) => {
    fireEvent.keyDown(handle, { keyCode: keyCodes.escape });
    fireEvent(handle, getTransitionEnd());
  },
};

export const keyboard: Control = {
  name: 'keyboard',
  preLift: () => {},
  lift: (handle: HTMLElement) => {
    fireEvent.keyDown(handle, { keyCode: keyCodes.space });
  },
  move: (handle: HTMLElement) => {
    fireEvent.keyDown(handle, {
      keyCode: keyCodes.arrowDown,
    });
  },
  drop: (handle: HTMLElement) => {
    fireEvent.keyDown(handle, { keyCode: keyCodes.space });
    // no drop animation
  },
  cancel: (handle: HTMLElement) => {
    fireEvent.keyDown(handle, { keyCode: keyCodes.escape });
  },
};

export const touch: Control = {
  name: 'touch',
  preLift: (handle: HTMLElement) => {
    fireEvent.touchStart(handle, { touches: [{ clientX: 0, clientY: 0 }] });
  },
  lift: () => {
    act(() => {
      jest.runTimersToTime(defaultTimeForLongPress);
    });
  },
  move: (handle: HTMLElement) => {
    fireEvent.touchMove(handle, {
      touches: [{ clientX: 0, clientY: 1 }],
    });
    act(() => {
      // movements are throttled by raf
      requestAnimationFrame.step();
    });
  },
  drop: (handle: HTMLElement) => {
    fireEvent.touchEnd(handle);
    // allow for drop animation
    fireEvent(handle, getTransitionEnd());
  },
  cancel: (handle: HTMLElement) => {
    fireEvent.keyDown(handle, { keyCode: keyCodes.escape });
    fireEvent(handle, getTransitionEnd());
  },
};

export const controls: Control[] = [mouse, keyboard, touch];

export const forEachSensor = (tests: (control: Control) => void) => {
  controls.forEach((control: Control) => {
    describe(`with: ${control.name}`, () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
      });

      tests(control);
    });
  });
};
