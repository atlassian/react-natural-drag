// @flow
import { type Position, type Spacing } from 'css-box-model';
import getBestAxisDroppable from '../../../../../src/state/move-in-direction/move-axis/get-best-axis-droppable';
import { getDroppableDimension } from '../../../../util/dimension';
import { add } from '../../../../../src/state/position';
import { horizontal, vertical } from '../../../../../src/state/axis';
import getViewport from '../../../../../src/view/window/get-viewport';
import type {
  Viewport,
  Axis,
  DroppableDimension,
  DroppableDimensionMap,
} from '../../../../../src/types';

const viewport: Viewport = getViewport();

describe('get best cross axis droppable', () => {
  describe('on the vertical axis', () => {
    const axis: Axis = vertical;

    it('should return the first droppable on the cross axis when moving forward', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const forward = getDroppableDimension({
        descriptor: {
          id: 'forward',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 30,
          right: 40,
          bottom: 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [forward.descriptor.id]: forward,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(forward);
    });

    it('should return the first droppable on the cross axis when moving backward', () => {
      const behind = getDroppableDimension({
        descriptor: {
          id: 'behind',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 30,
          right: 40,
          bottom: 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [behind.descriptor.id]: behind,
        [source.descriptor.id]: source,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        // moving backwards
        isMovingForward: false,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        viewport,
        droppables,
      });

      expect(result).toBe(behind);
    });

    it('should exclude options that are not in the desired direction', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const behind = getDroppableDimension({
        descriptor: {
          id: 'behind',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 10,
          bottom: 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [behind.descriptor.id]: behind,
        [source.descriptor.id]: source,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });
      expect(result).toBe(null);

      // checking that it would have been returned if was moving in the other direction
      const result2: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: false,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });
      expect(result2).toBe(behind);
    });

    it('should exclude options that are not enabled', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const disabled = getDroppableDimension({
        descriptor: {
          id: 'disabled',
          type: 'TYPE',
          mode: 'standard',
        },
        isEnabled: false,
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 30,
          right: 40,
          bottom: 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [disabled.descriptor.id]: disabled,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    it('should exclude options that are not in the viewport', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const outsideViewport = getDroppableDimension({
        descriptor: {
          id: 'outsideViewport',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          left: 30,
          right: 40,
          top: viewport.frame.bottom + 1,
          bottom: viewport.frame.bottom + 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [outsideViewport.descriptor.id]: outsideViewport,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    it('should exclude options that do not overlap on the main axis', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const noOverlap = getDroppableDimension({
        descriptor: {
          id: 'noOverlap',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          // top is below where the source ended
          top: 11,
          left: 30,
          right: 40,
          bottom: 20,
        },
      });

      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [noOverlap.descriptor.id]: noOverlap,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    describe('more than one option share the same crossAxisStart value', () => {
      // this happens when two lists sit on top of one another
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 20,
          bottom: 100,
        },
      });
      const sibling1 = getDroppableDimension({
        descriptor: {
          id: 'sibling1',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 20,
          left: 20,
          right: 40,
          // long droppable inside a shorter container - this should be clipped
          bottom: 80,
        },
        closest: {
          borderBox: {
            // not the same top value as source
            top: 20,
            // shares the left edge with the source
            left: 20,
            right: 40,
            bottom: 40,
          },
          scrollSize: {
            scrollWidth: 20,
            scrollHeight: 80,
          },
          scroll: { x: 0, y: 0 },
          shouldClipSubject: true,
        },
      });
      const sibling2 = getDroppableDimension({
        descriptor: {
          id: 'sibling2',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          // shares the bottom edge with sibling1
          top: 40,
          // shares the left edge with the source
          left: 20,
          right: 40,
          bottom: 60,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [sibling1.descriptor.id]: sibling1,
        [sibling2.descriptor.id]: sibling2,
      };

      it('should return a droppable where the center position (axis.line) of the draggable draggable sits within the size of a droppable', () => {
        // sitting inside source - but within the size of sibling2 on the main axis
        const center: Position = {
          y: 50,
          x: 10,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(sibling2);
      });

      it('should account for container clipping', () => {
        // inside sibling1's droppable bounds, but outside its clipped bounds
        const center: Position = {
          y: 50,
          x: 10,
        };

        // if we're clipping dimensions correctly we should land in sibling2
        // if not, we'll land in sibling1
        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(sibling2);
      });

      describe('center point is not contained within a droppable', () => {
        it('should return the droppable that has the closest corner', () => {
          // Choosing a point that is above the first sibling
          const center: Position = {
            // above sibling 1
            y: 10,
            x: 10,
          };

          const result: ?DroppableDimension = getBestAxisDroppable({
            isMovingForward: true,
            pageBorderBoxCenter: center,
            source,
            droppables,
            viewport,
          });

          expect(result).toBe(sibling1);
        });

        it('should choose the droppable that is furthest back (closest to {x: 0, y: 0} on the screen) in the event of a tie', () => {
          // Choosing a point that is above the first sibling
          const center: Position = {
            // this line is shared between sibling1 and sibling2
            y: 40,
            x: 10,
          };

          const result: ?DroppableDimension = getBestAxisDroppable({
            isMovingForward: true,
            pageBorderBoxCenter: center,
            source,
            droppables,
            viewport,
          });

          expect(result).toBe(sibling1);

          // checking that center position was selected correctly
          const center2: Position = add(center, { x: 0, y: 1 });
          const result2: ?DroppableDimension = getBestAxisDroppable({
            isMovingForward: true,
            pageBorderBoxCenter: center2,
            source,
            droppables,
            viewport,
          });
          expect(result2).toBe(sibling2);
        });
      });
    });
  });

  describe('on the horizontal axis', () => {
    const axis: Axis = horizontal;

    it('should return the first droppable on the cross axis when moving forward', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 20,
          bottom: 20,
        },
      });
      const forward = getDroppableDimension({
        descriptor: {
          id: 'forward',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 20,
          left: 0,
          right: 20,
          bottom: 30,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [forward.descriptor.id]: forward,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(forward);
    });

    it('should return the first droppable on the cross axis when moving backward', () => {
      const behind = getDroppableDimension({
        descriptor: {
          id: 'behind',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 20,
          bottom: 10,
        },
      });
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 10,
          left: 0,
          right: 20,
          bottom: 20,
        },
      });
      const droppables: DroppableDimensionMap = {
        [behind.descriptor.id]: behind,
        [source.descriptor.id]: source,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        // moving backwards
        isMovingForward: false,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        viewport,
        droppables,
      });

      expect(result).toBe(behind);
    });

    it('should exclude options that are not in the desired direction', () => {
      const behind = getDroppableDimension({
        descriptor: {
          id: 'behind',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 20,
          bottom: 10,
        },
      });
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 10,
          left: 0,
          right: 20,
          bottom: 20,
        },
      });
      const droppables: DroppableDimensionMap = {
        [behind.descriptor.id]: behind,
        [source.descriptor.id]: source,
      };

      // now moving in the other direction
      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });
      expect(result).toBe(null);

      // Ensuring that normally it would be returned if moving in the right direction
      const result2: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: false,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });
      expect(result2).toBe(behind);
    });

    it('should exclude options that are not enabled', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        },
      });
      const disabled = getDroppableDimension({
        descriptor: {
          id: 'disabled',
          type: 'TYPE',
          mode: 'standard',
        },
        isEnabled: false,
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 30,
          right: 40,
          bottom: 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [disabled.descriptor.id]: disabled,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    it('should exclude options that are not visible in their frame', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          [axis.start]: 0,
          [axis.end]: 100,
          [axis.crossAxisStart]: 0,
          [axis.crossAxisEnd]: 100,
        },
      });
      const subjectNotVisibleThroughFrame = getDroppableDimension({
        descriptor: {
          id: 'notInViewport',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        // totally hidden by frame
        borderBox: {
          [axis.start]: 0,
          [axis.end]: 100,
          // would normally be a good candidate
          [axis.crossAxisStart]: 200,
          [axis.crossAxisEnd]: 300,
        },
        closest: {
          borderBox: {
            [axis.start]: 0,
            [axis.end]: 100,
            // frame hides subject
            [axis.crossAxisStart]: 400,
            [axis.crossAxisEnd]: 500,
          },
          scroll: { x: 0, y: 0 },
          scrollSize: {
            scrollWidth: 100,
            scrollHeight: 100,
          },
          shouldClipSubject: true,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [subjectNotVisibleThroughFrame.descriptor
          .id]: subjectNotVisibleThroughFrame,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    it('should exclude options that are not in the viewport', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          bottom: 10,
          left: 20,
          right: 30,
        },
      });
      const notInViewport = getDroppableDimension({
        descriptor: {
          id: 'notInViewport',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          bottom: 10,
          left: viewport.frame.right + 1,
          right: viewport.frame.right + 10,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [notInViewport.descriptor.id]: notInViewport,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    it('should exclude options that do not overlap on the main axis', () => {
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 20,
          bottom: 10,
        },
      });
      const noOverlap = getDroppableDimension({
        descriptor: {
          id: 'noOverlap',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          // comes after the source
          top: 10,
          // but its left value is > the rigt of the source
          left: 30,
          right: 40,
          bottom: 20,
        },
      });

      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [noOverlap.descriptor.id]: noOverlap,
      };

      const result: ?DroppableDimension = getBestAxisDroppable({
        isMovingForward: true,
        pageBorderBoxCenter: source.page.borderBox.center,
        source,
        droppables,
        viewport,
      });

      expect(result).toBe(null);
    });

    describe('more than one option share the same crossAxisStart value', () => {
      // this happens when two lists sit side by side
      const source = getDroppableDimension({
        descriptor: {
          id: 'source',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          top: 0,
          left: 0,
          right: 100,
          bottom: 10,
        },
      });
      const sibling1 = getDroppableDimension({
        descriptor: {
          id: 'sibling1',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          // shares an edge with the source
          top: 10,
          // shares the left edge with the source
          left: 20,
          right: 40,
          bottom: 20,
        },
      });
      const sibling2 = getDroppableDimension({
        descriptor: {
          id: 'sibling2',
          type: 'TYPE',
          mode: 'standard',
        },
        direction: axis.direction,
        borderBox: {
          // shares an edge with the source
          top: 10,
          // shares the left edge with the source
          left: 40,
          right: 60,
          bottom: 20,
        },
      });
      const droppables: DroppableDimensionMap = {
        [source.descriptor.id]: source,
        [sibling1.descriptor.id]: sibling1,
        [sibling2.descriptor.id]: sibling2,
      };

      it('should return a droppable where the center position (axis.line) of the draggable draggable sits within the size of a droppable', () => {
        // sitting inside source - but within the size of sibling2 on the main axis
        const center: Position = {
          y: 5,
          x: 50,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(sibling2);
      });

      describe('center point is not contained within a droppable', () => {
        it('should return the droppable that has the closest corner', () => {
          // Choosing a point that is before the first sibling
          const center: Position = {
            // above sibling 1
            y: 5,
            // before the left value of sibling 1
            x: 10,
          };

          const result: ?DroppableDimension = getBestAxisDroppable({
            isMovingForward: true,
            pageBorderBoxCenter: center,
            source,
            droppables,
            viewport,
          });

          expect(result).toBe(sibling1);
        });

        it('should choose the droppable that is furthest back (closest to {x: 0, y: 0} on the screen) in the event of a tie', () => {
          // Choosing a point that is above the first sibling
          const center: Position = {
            y: 5,
            // this line is shared between sibling1 and sibling2
            x: 40,
          };

          const result: ?DroppableDimension = getBestAxisDroppable({
            isMovingForward: true,
            pageBorderBoxCenter: center,
            source,
            droppables,
            viewport,
          });

          expect(result).toBe(sibling1);

          // checking that center point is correct

          const center2: Position = add(center, { y: 0, x: 1 });
          const result2: ?DroppableDimension = getBestAxisDroppable({
            isMovingForward: true,
            pageBorderBoxCenter: center2,
            source,
            droppables,
            viewport,
          });

          expect(result2).toBe(sibling2);
        });
      });
    });
  });

  describe('overlap', () => {
    const axis: Axis = vertical;

    describe('moving forward', () => {
      it('allow overlap as long as the end of the target is after the end of the source', () => {
        const box: Spacing = {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        };
        const source = getDroppableDimension({
          descriptor: {
            id: 'source',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const forward = getDroppableDimension({
          descriptor: {
            id: 'forward',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: {
            ...box,
            right: box.right + 1,
          },
        });
        const droppables: DroppableDimensionMap = {
          [source.descriptor.id]: source,
          [forward.descriptor.id]: forward,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: source.page.borderBox.center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(forward);
      });

      it('should not allow movement when the droppables are on top of each other', () => {
        const box: Spacing = {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        };
        const source = getDroppableDimension({
          descriptor: {
            id: 'source',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const forward = getDroppableDimension({
          descriptor: {
            id: 'forward',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const droppables: DroppableDimensionMap = {
          [source.descriptor.id]: source,
          [forward.descriptor.id]: forward,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: source.page.borderBox.center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(null);
      });

      it('should not allow movement the right edge of the source is not greater than the right edge of the target', () => {
        const box: Spacing = {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        };
        const source = getDroppableDimension({
          descriptor: {
            id: 'source',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const forward = getDroppableDimension({
          descriptor: {
            id: 'forward',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: {
            ...box,
            // forward a little bit
            left: box.left + 1,
            // not far enough
            right: box.right - 1,
          },
        });
        const droppables: DroppableDimensionMap = {
          [source.descriptor.id]: source,
          [forward.descriptor.id]: forward,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: source.page.borderBox.center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(null);
      });
    });

    describe('moving backwards', () => {
      it('should allow overlap as long as the start of the target is before the start of the source', () => {
        const box: Spacing = {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        };
        const source = getDroppableDimension({
          descriptor: {
            id: 'source',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const backwards = getDroppableDimension({
          descriptor: {
            id: 'forward',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: {
            ...box,
            left: box.left - 1,
          },
        });
        const droppables: DroppableDimensionMap = {
          [source.descriptor.id]: source,
          [backwards.descriptor.id]: backwards,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: false,
          pageBorderBoxCenter: source.page.borderBox.center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(backwards);
      });

      it('should not allow movement when the droppables are on top of each other', () => {
        const box: Spacing = {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        };
        const source = getDroppableDimension({
          descriptor: {
            id: 'source',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const backward = getDroppableDimension({
          descriptor: {
            id: 'forward',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const droppables: DroppableDimensionMap = {
          [source.descriptor.id]: source,
          [backward.descriptor.id]: backward,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: false,
          pageBorderBoxCenter: source.page.borderBox.center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(null);
      });

      it('should not allow movement left edge of the source is not greater than the left edge of the target', () => {
        const box: Spacing = {
          top: 0,
          left: 20,
          right: 30,
          bottom: 10,
        };
        const source = getDroppableDimension({
          descriptor: {
            id: 'source',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: box,
        });
        const backward = getDroppableDimension({
          descriptor: {
            id: 'forward',
            type: 'TYPE',
            mode: 'standard',
          },
          direction: axis.direction,
          borderBox: {
            ...box,
            // backward a little bit
            right: box.right - 1,
            // not far enough
            left: box.left,
          },
        });
        const droppables: DroppableDimensionMap = {
          [source.descriptor.id]: source,
          [backward.descriptor.id]: backward,
        };

        const result: ?DroppableDimension = getBestAxisDroppable({
          isMovingForward: true,
          pageBorderBoxCenter: source.page.borderBox.center,
          source,
          droppables,
          viewport,
        });

        expect(result).toBe(null);
      });
    });
  });
});
