// @flow
import { type Position } from 'css-box-model';
import type {
  Viewport,
  Axis,
  DragImpact,
  DisplacedBy,
} from '../../../../../../src/types';
import { invariant } from '../../../../../../src/invariant';
import { vertical, horizontal } from '../../../../../../src/state/axis';
import getDisplacedBy from '../../../../../../src/state/get-displaced-by';
import getLiftEffect from '../../../../../../src/state/get-lift-effect';
import moveToNewDroppable from '../../../../../../src/state/move-in-direction/move-axis/move-to-new-droppable';
import { getPreset } from '../../../../../util/dimension';
import { getForcedDisplacement } from '../../../../../util/impact';
import { emptyGroups } from '../../../../../../src/state/no-impact';

const dontCare: Position = { x: 0, y: 0 };

[vertical, horizontal].forEach((axis: Axis) => {
  describe(`on ${axis.direction} axis`, () => {
    const preset = getPreset(axis);
    const viewport: Viewport = preset.viewport;

    it('should not to anything if there is not target (can happen if invisible)', () => {
      const { afterCritical } = getLiftEffect({
        draggable: preset.inHome2,
        home: preset.home,
        draggables: preset.draggables,
        viewport: preset.viewport,
      });

      expect(
        moveToNewDroppable({
          previousPageBorderBoxCenter: dontCare,
          destination: preset.home,
          insideDestination: preset.inHomeList,
          draggable: preset.inHome1,
          draggables: preset.draggables,
          moveRelativeTo: null,
          viewport,
          afterCritical,
        }),
      ).toBe(null);
    });

    describe('moving back into original index', () => {
      it('should return a home impact with the original location', () => {
        // the second draggable is moving back into its preset.home
        const { afterCritical } = getLiftEffect({
          draggable: preset.inHome2,
          home: preset.home,
          draggables: preset.draggables,
          viewport: preset.viewport,
        });
        const displacedBy: DisplacedBy = getDisplacedBy(
          axis,
          preset.inHome2.displaceBy,
        );

        const result: ?DragImpact = moveToNewDroppable({
          previousPageBorderBoxCenter: dontCare,
          draggable: preset.inHome2,
          draggables: preset.draggables,
          moveRelativeTo: preset.inHome2,
          destination: preset.home,
          insideDestination: preset.inHomeList,
          viewport,
          afterCritical,
        });
        invariant(result);

        const expected: DragImpact = {
          displaced: getForcedDisplacement({
            // unlike the original displacement, this will be animated
            visible: [
              { dimension: preset.inHome3 },
              { dimension: preset.inHome4 },
            ],
          }),
          displacedBy,
          at: {
            type: 'REORDER',
            destination: {
              droppableId: preset.home.descriptor.id,
              index: preset.inHome2.descriptor.index,
            },
          },
        };
        expect(result).toEqual(expected);
      });
    });

    describe('moving before the original index', () => {
      it('should move the everything after the target index forward', () => {
        // moving preset.inHome4 into the preset.inHome2 position
        const { afterCritical } = getLiftEffect({
          draggable: preset.inHome4,
          home: preset.home,
          draggables: preset.draggables,
          viewport: preset.viewport,
        });
        const displacedBy: DisplacedBy = getDisplacedBy(
          axis,
          preset.inHome4.displaceBy,
        );

        const result: ?DragImpact = moveToNewDroppable({
          previousPageBorderBoxCenter: dontCare,
          draggable: preset.inHome4,
          draggables: preset.draggables,
          moveRelativeTo: preset.inHome2,
          destination: preset.home,
          insideDestination: preset.inHomeList,
          viewport,
          afterCritical,
        });
        invariant(result);

        const expected: DragImpact = {
          displaced: getForcedDisplacement({
            visible: [
              { dimension: preset.inHome2 },
              { dimension: preset.inHome3 },
              // inHome4 not displaced!
            ],
          }),
          displacedBy,
          at: {
            type: 'REORDER',
            destination: {
              droppableId: preset.home.descriptor.id,
              index: preset.inHome2.descriptor.index,
            },
          },
        };
        expect(result).toEqual(expected);
      });
    });

    describe('moving after the original index', () => {
      it('should move the everything from the target index to the original index forward', () => {
        // moving inHome1 after inHome4
        const { afterCritical } = getLiftEffect({
          draggable: preset.inHome1,
          home: preset.home,
          draggables: preset.draggables,
          viewport: preset.viewport,
        });
        const displacedBy: DisplacedBy = getDisplacedBy(
          axis,
          preset.inHome1.displaceBy,
        );
        const result: ?DragImpact = moveToNewDroppable({
          previousPageBorderBoxCenter: dontCare,
          draggable: preset.inHome1,
          draggables: preset.draggables,
          moveRelativeTo: preset.inHome4,
          destination: preset.home,
          insideDestination: preset.inHomeList,
          viewport,
          afterCritical,
        });
        invariant(result);

        const expected: DragImpact = {
          displaced: emptyGroups,
          displacedBy,
          at: {
            type: 'REORDER',
            destination: {
              droppableId: preset.home.descriptor.id,
              index: preset.inHome4.descriptor.index,
            },
          },
        };
        expect(result).toEqual(expected);
      });
    });
  });
});
