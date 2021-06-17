// @flow
import type { BoxModel, Position, Spacing } from 'css-box-model';
import type {
  Viewport,
  Axis,
  DragImpact,
  DroppableDimension,
  DisplacedBy,
} from '../../../../../../src/types';
import { invariant } from '../../../../../../src/invariant';
import { horizontal, vertical } from '../../../../../../src/state/axis';
import scrollDroppable from '../../../../../../src/state/droppable/scroll-droppable';
import { goIntoStart } from '../../../../../../src/state/get-center-from-impact/move-relative-to';
import getDisplacedBy from '../../../../../../src/state/get-displaced-by';
import getLiftEffect from '../../../../../../src/state/get-lift-effect';
import moveToNewDroppable from '../../../../../../src/state/move-in-direction/move-axis/move-to-new-droppable';
import {
  add,
  negate,
  patch,
  subtract,
} from '../../../../../../src/state/position';
import scrollViewport from '../../../../../../src/state/scroll-viewport';
import { offsetByPosition } from '../../../../../../src/state/spacing';
import {
  getDroppableDimension,
  getPreset,
  makeScrollable,
} from '../../../../../util/dimension';
import { getForcedDisplacement } from '../../../../../util/impact';
import {
  emptyGroups,
  noDisplacedBy,
} from '../../../../../../src/state/no-impact';

[vertical, horizontal].forEach((axis: Axis) => {
  describe(`on ${axis.direction} axis`, () => {
    const preset = getPreset(axis);
    const viewport: Viewport = preset.viewport;

    describe('moving into an unpopulated list', () => {
      const { afterCritical } = getLiftEffect({
        draggable: preset.inHome1,
        home: preset.home,
        draggables: preset.draggables,
        viewport: preset.viewport,
      });

      it('should move into the first position of the list', () => {
        const result: ?DragImpact = moveToNewDroppable({
          previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
          draggable: preset.inHome1,
          draggables: preset.draggables,
          moveRelativeTo: null,
          destination: preset.emptyForeign,
          insideDestination: [],
          viewport,
          afterCritical,
        });
        invariant(result);

        const expected: DragImpact = {
          displaced: emptyGroups,
          displacedBy: noDisplacedBy,
          at: {
            type: 'REORDER',
            destination: {
              droppableId: preset.emptyForeign.descriptor.id,
              index: 0,
            },
          },
        };

        expect(result).toEqual(expected);
      });

      describe('only move into first position if it is visible', () => {
        const distanceToContentBoxStart = (box: BoxModel): number =>
          box.margin[axis.start] +
          box.border[axis.start] +
          box.padding[axis.start];

        it('should not move into the start of list if the position is not visible due to droppable scroll', () => {
          const whatNewCenterWouldBeWithoutScroll: Position = goIntoStart({
            axis,
            moveInto: preset.emptyForeign.page,
            isMoving: preset.inHome1.page,
          });
          const totalShift: Position = subtract(
            whatNewCenterWouldBeWithoutScroll,
            preset.inHome1.page.borderBox.center,
          );
          const shiftedInHome1Page: Spacing = offsetByPosition(
            preset.inHome1.page.borderBox,
            totalShift,
          );
          invariant(preset.emptyForeign.subject.active);
          const maxAllowableScroll: Position = negate(
            subtract(
              patch(axis.line, preset.emptyForeign.subject.active[axis.start]),
              patch(axis.line, shiftedInHome1Page[axis.start]),
            ),
          );
          const pastMaxAllowableScroll: Position = add(
            maxAllowableScroll,
            patch(axis.line, 1),
          );

          // validation: no scrolled droppable
          {
            const result: ?DragImpact = moveToNewDroppable({
              previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
              draggable: preset.inHome1,
              draggables: preset.draggables,
              moveRelativeTo: null,
              destination: preset.emptyForeign,
              insideDestination: [],
              viewport,
              afterCritical,
            });
            expect(result).toBeTruthy();
          }

          // center on visible edge = can move
          {
            const scrollable: DroppableDimension = makeScrollable(
              preset.foreign,
              maxAllowableScroll[axis.line],
            );
            const scrolled: DroppableDimension = scrollDroppable(
              scrollable,
              maxAllowableScroll,
            );

            const result: ?DragImpact = moveToNewDroppable({
              previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
              draggable: preset.inHome1,
              draggables: preset.draggables,
              moveRelativeTo: null,
              destination: scrolled,
              insideDestination: [],
              viewport,
              afterCritical,
            });
            expect(result).toBeTruthy();
          }
          // center past visible edge = cannot move
          {
            const scrollable: DroppableDimension = makeScrollable(
              preset.emptyForeign,
              pastMaxAllowableScroll[axis.line],
            );
            const scrolled: DroppableDimension = scrollDroppable(
              scrollable,
              pastMaxAllowableScroll,
            );
            const result: ?DragImpact = moveToNewDroppable({
              previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
              draggable: preset.inHome1,
              draggables: preset.draggables,
              moveRelativeTo: null,
              destination: scrolled,
              insideDestination: [],
              viewport,
              afterCritical,
            });

            expect(result).toBe(null);
          }
        });

        it('should not move into the start of list if the position is not visible due to page scroll', () => {
          const emptyForeignPageBox: BoxModel = preset.emptyForeign.page;

          // How far to the start of the droppable content box?
          const distanceToStartOfDroppableContextBox: number =
            emptyForeignPageBox.marginBox[axis.start] +
            distanceToContentBoxStart(emptyForeignPageBox);

          const onVisibleStartEdge: Position = patch(
            axis.line,
            distanceToStartOfDroppableContextBox +
              preset.inHome1.page.margin[axis.start],
          );
          const pastVisibleStartEdge: Position = add(
            onVisibleStartEdge,
            patch(axis.line, 1),
          );
          // validate with no scroll
          {
            const result: ?DragImpact = moveToNewDroppable({
              previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
              draggable: preset.inHome1,
              draggables: preset.draggables,
              destination: preset.emptyForeign,
              moveRelativeTo: null,
              insideDestination: [],
              viewport,
              afterCritical,
            });

            expect(result).toBeTruthy();
          }
          // center on visible edge = can move
          {
            const scrolled: Viewport = scrollViewport(
              viewport,
              onVisibleStartEdge,
            );

            const result: ?DragImpact = moveToNewDroppable({
              previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
              draggable: preset.inHome1,
              draggables: preset.draggables,
              destination: preset.emptyForeign,
              moveRelativeTo: null,
              insideDestination: [],
              viewport: scrolled,
              afterCritical,
            });

            expect(result).toBeTruthy();
          }
          // start is no longer visible = cannot move
          {
            const scrolled: Viewport = scrollViewport(
              viewport,
              pastVisibleStartEdge,
            );

            const result: ?DragImpact = moveToNewDroppable({
              previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
              draggable: preset.inHome1,
              draggables: preset.draggables,
              moveRelativeTo: null,
              destination: preset.emptyForeign,
              insideDestination: [],
              viewport: scrolled,
              afterCritical,
            });

            expect(result).toBe(null);
          }
        });

        it('should allow a big item to move into a smaller list', () => {
          const crossAxisStart: number =
            preset.home.client.marginBox[axis.crossAxisEnd] + 1;
          const smallDroppable: DroppableDimension = getDroppableDimension({
            descriptor: {
              id: 'small',
              type: preset.home.descriptor.type,
              mode: 'standard',
            },
            // currently no room in the box
            borderBox: {
              [axis.crossAxisStart]: crossAxisStart,
              [axis.crossAxisEnd]: crossAxisStart,
              [axis.start]: 0,
              [axis.end]: 0,
            },
            direction: axis.direction,
            windowScroll: preset.windowScroll,
          });

          const result: ?DragImpact = moveToNewDroppable({
            previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
            draggable: preset.inHome1,
            draggables: preset.draggables,
            moveRelativeTo: null,
            destination: smallDroppable,
            insideDestination: [],
            viewport,
            afterCritical,
          });

          expect(result).toBeTruthy();
        });
      });
    });

    describe('is going before a target', () => {
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

      it('should move the target and everything below it forward', () => {
        // moving home1 into the second position of the list

        const result: ?DragImpact = moveToNewDroppable({
          previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
          draggable: preset.inHome1,
          draggables: preset.draggables,
          // moving before target
          moveRelativeTo: preset.inForeign2,
          destination: preset.foreign,
          insideDestination: preset.inForeignList,
          viewport,
          afterCritical,
        });
        invariant(result);

        const expected: DragImpact = {
          displaced: getForcedDisplacement({
            // ordered by closest impacted
            visible: [
              { dimension: preset.inForeign2 },
              { dimension: preset.inForeign3 },
              { dimension: preset.inForeign4 },
            ],
          }),
          displacedBy,
          at: {
            type: 'REORDER',
            destination: {
              droppableId: preset.foreign.descriptor.id,
              index: preset.inForeign2.descriptor.index,
            },
          },
        };

        expect(result).toEqual(expected);
      });
    });

    describe('is going after a target', () => {
      it('should move the target and everything below it forward', () => {
        // moving inHome3 relative to inForeign1 (will go after inForeign1)
        const { afterCritical } = getLiftEffect({
          draggable: preset.inHome1,
          home: preset.home,
          draggables: preset.draggables,
          viewport: preset.viewport,
        });
        const displacedBy: DisplacedBy = getDisplacedBy(
          axis,
          preset.inHome3.displaceBy,
        );
        const result: ?DragImpact = moveToNewDroppable({
          previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
          draggable: preset.inHome3,
          draggables: preset.draggables,
          // moving relative to inForeign1
          // will actually go after it
          moveRelativeTo: preset.inForeign1,
          destination: preset.foreign,
          insideDestination: preset.inForeignList,
          viewport,
          afterCritical,
        });

        const expected: DragImpact = {
          displaced: getForcedDisplacement({
            // everything after inForeign1
            // ordered by closest impacted
            visible: [
              { dimension: preset.inForeign2 },
              { dimension: preset.inForeign3 },
              { dimension: preset.inForeign4 },
            ],
          }),
          displacedBy,
          at: {
            type: 'REORDER',
            destination: {
              droppableId: preset.foreign.descriptor.id,
              index: preset.inForeign2.descriptor.index,
            },
          },
        };
        expect(result).toEqual(expected);
      });
    });

    describe('is moving after the last position of a list', () => {
      it('should go after the non-displaced last item in the list', () => {
        // Moving inHome4 relative to inForeign1
        // Stripping out all the other items in the foreign so that we
        // are sure to move after the last item (inForeign1)
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
          previousPageBorderBoxCenter: preset.inHome1.page.borderBox.center,
          draggable: preset.inHome4,
          draggables: preset.draggables,
          moveRelativeTo: preset.inForeign1,
          destination: preset.foreign,
          insideDestination: [preset.inForeign1],
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
              droppableId: preset.foreign.descriptor.id,
              index: preset.inForeign1.descriptor.index + 1,
            },
          },
        };
        expect(result).toEqual(expected);
      });
    });
  });
});
