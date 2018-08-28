// @flow
import type { BoxModel, Rect, Position } from 'css-box-model';

export type Id = string;
export type DraggableId = Id;
export type DroppableId = Id;
export type TypeId = Id;
export type ZIndex = number | string;

export type DroppableDescriptor = {|
  id: DroppableId,
  type: TypeId,
|};

export type DraggableDescriptor = {|
  id: DraggableId,
  index: number,
  // Inherited from Droppable
  droppableId: DroppableId,
  // This is technically redundant but it avoids
  // needing to look up a parent droppable just to get its type
  type: TypeId,
|};

export type Direction = 'horizontal' | 'vertical';

export type VerticalAxis = {|
  direction: 'vertical',
  line: 'y',
  start: 'top',
  end: 'bottom',
  size: 'height',
  crossAxisLine: 'x',
  crossAxisStart: 'left',
  crossAxisEnd: 'right',
  crossAxisSize: 'width',
|};

export type HorizontalAxis = {|
  direction: 'horizontal',
  line: 'x',
  start: 'left',
  end: 'right',
  size: 'width',
  crossAxisLine: 'y',
  crossAxisStart: 'top',
  crossAxisEnd: 'bottom',
  crossAxisSize: 'height',
|};

export type Axis = VerticalAxis | HorizontalAxis;

export type ScrollSize = {|
  scrollHeight: number,
  scrollWidth: number,
|};

export type ScrollDetails = {|
  initial: Position,
  current: Position,
  // the maximum allowable scroll for the frame
  max: Position,
  diff: {|
    value: Position,
    // The actual displacement as a result of a scroll is in the opposite
    // direction to the scroll itself. When scrolling down items are displaced
    // upwards. This value is the negated version of the 'value'
    displacement: Position,
  |},
|};

export type Placeholder = {|
  client: BoxModel,
  tagName: string,
  display: string,
|};

export type DraggableDimension = {|
  descriptor: DraggableDescriptor,
  // the placeholder for the draggable
  placeholder: Placeholder,
  // relative to the viewport when the drag started
  client: BoxModel,
  // relative to the whole page
  page: BoxModel,
  // how much displacement the draggable causes
  // this is the size of the marginBox
  displaceBy: Position,
|};

export type Scrollable = {|
  // This is the window through which the droppable is observed
  // It does not change during a drag
  pageMarginBox: Rect,
  // Used for comparision with dynamic recollecting
  frameClient: BoxModel,
  scrollSize: ScrollSize,
  // Whether or not we should clip the subject by the frame
  // Is controlled by the ignoreContainerClipping prop
  shouldClipSubject: boolean,
  scroll: ScrollDetails,
|};

export type DroppableSubject = {|
  // raw, unchanging
  pageMarginBox: Rect,
  withPlaceholder: ?Position,
  // The hitbox for a droppable
  // - page margin box
  // - with scroll changes
  // - with any additional droppable placeholder
  // - clipped by frame
  // The subject will be null if the hit area is completely empty
  active: ?Rect,
|};

export type DroppableDimension = {|
  descriptor: DroppableDescriptor,
  axis: Axis,
  isEnabled: boolean,
  isGroupingEnabled: boolean,
  // relative to the current viewport
  client: BoxModel,
  // relative to the whole page
  page: BoxModel,
  // The container of the droppable
  frame: ?Scrollable,
  // what is visible through the frame
  subject: DroppableSubject,
|};
export type DraggableLocation = {|
  droppableId: DroppableId,
  index: number,
|};

export type DraggableDimensionMap = { [key: DraggableId]: DraggableDimension };
export type DroppableDimensionMap = { [key: DroppableId]: DroppableDimension };

export type Displacement = {|
  draggableId: DraggableId,
  isVisible: boolean,
  shouldAnimate: boolean,
|};

export type DisplacementMap = { [key: DraggableId]: Displacement };

export type DisplacedBy = {|
  value: number,
  point: Position,
|};

export type DragMovement = {|
  // The draggables that need to move in response to a drag.
  // Ordered by closest draggable to the *current* location of the dragging item
  displaced: Displacement[],
  // displaced as a map
  map: DisplacementMap,
  isInFrontOfStart: boolean,
  displacedBy: DisplacedBy,
|};

export type VerticalUserDirection = 'up' | 'down';
export type HorizontalUserDirection = 'left' | 'right';

export type UserDirection = {|
  vertical: VerticalUserDirection,
  horizontal: HorizontalUserDirection,
|};

export type GroupingLocation = {|
  droppableId: DroppableId,
  draggableId: DraggableId,
|};

export type GroupingImpact = {|
  // This has an impact on the hitbox for a grouping action
  whenEntered: UserDirection,
  groupingWith: GroupingLocation,
|};

export type DragImpact = {|
  movement: DragMovement,
  // the direction of the Droppable you are over
  direction: ?Direction,
  destination: ?DraggableLocation,
  group: ?GroupingImpact,
|};

export type ClientPositions = {|
  // where the user initially selected
  // This point is not used to calculate the impact of a dragging item
  // It is used to calculate the offset from the initial selection point
  selection: Position,
  // the current center of the item
  borderBoxCenter: Position,
  // how far the item has moved from its original position
  offset: Position,
|};

export type PagePositions = {|
  selection: Position,
  borderBoxCenter: Position,
|};

// When dragging with a pointer such as a mouse or touch input we want to automatically
// scroll user the under input when we get near the bottom of a Droppable or the window.
// When Dragging with a keyboard we want to jump as required
export type AutoScrollMode = 'FLUID' | 'JUMP';

// export type Viewport = {|
//   scroll: Position,
//   maxScroll: Position,
//   subject: Rect,
// |}

export type DragPositions = {|
  client: ClientPositions,
  page: PagePositions,
|};

// published when a drag starts
export type DragStart = {|
  draggableId: DraggableId,
  type: TypeId,
  source: DraggableLocation,
|};

export type DragUpdate = {|
  ...DragStart,
  // may not have any destination (drag to nowhere)
  destination: ?DraggableLocation,
  // populated when a draggable is dragging over another in grouping mode
  grouping: ?GroupingLocation,
|};

export type DropReason = 'DROP' | 'CANCEL';

// published when a drag finishes
export type DropResult = {|
  ...DragUpdate,
  reason: DropReason,
|};

export type PendingDrop = {|
  // TODO: newHomeClientOffset
  newHomeOffset: Position,
  dropDuration: number,
  impact: DragImpact,
  result: DropResult,
|};

export type ScrollOptions = {|
  shouldPublishImmediately: boolean,
|};

// using the draggable id rather than the descriptor as the descriptor
// may change as a result of the initial flush. This means that the lift
// descriptor may not be the same as the actual descriptor. To avoid
// confusion the request is just an id which is looked up
// in the dimension-marshal post-flush
// Not including droppableId as it might change in a drop flush
export type LiftRequest = {|
  draggableId: DraggableId,
  scrollOptions: ScrollOptions,
|};

export type Critical = {|
  draggable: DraggableDescriptor,
  droppable: DroppableDescriptor,
|};

export type Viewport = {|
  // live updates with the latest values
  frame: Rect,
  scroll: ScrollDetails,
|};

export type DimensionMap = {|
  draggables: DraggableDimensionMap,
  droppables: DroppableDimensionMap,
|};

export type Published = {|
  additions: DraggableDimension[],
  removals: DraggableId[],
  modified: DroppableDimension[],
|};

export type IdleState = {|
  phase: 'IDLE',
|};

export type DraggingState = {|
  phase: 'DRAGGING',
  isDragging: true,
  critical: Critical,
  autoScrollMode: AutoScrollMode,
  dimensions: DimensionMap,
  initial: DragPositions,
  current: DragPositions,
  direction: UserDirection,
  impact: DragImpact,
  viewport: Viewport,
  // if we need to jump the scroll (keyboard dragging)
  scrollJumpRequest: ?Position,
  // whether or not draggable movements should be animated
  shouldAnimate: boolean,
|};

// While dragging we can enter into a bulk collection phase
// During this phase no drag updates are permitted.
// If a drop occurs during this phase, it must wait until it is
// completed before continuing with the drop
// TODO: rename to BulkCollectingState
export type CollectingState = {|
  ...DraggingState,
  phase: 'COLLECTING',
|};

// If a drop action occurs during a bulk collection we need to
// wait for the collection to finish before performing the drop.
// This is to ensure that everything has the correct index after
// a drop
export type DropPendingState = {|
  ...DraggingState,
  phase: 'DROP_PENDING',
  isWaiting: boolean,
  reason: DropReason,
|};

// An optional phase for animating the drop / cancel if it is needed
export type DropAnimatingState = {|
  phase: 'DROP_ANIMATING',
  pending: PendingDrop,
  // We still need to render placeholders and fix the dimensions of the dragging item
  dimensions: DimensionMap,
|};

export type State =
  | IdleState
  | DraggingState
  | CollectingState
  | DropPendingState
  | DropAnimatingState;

export type Announce = (message: string) => void;

export type HookProvided = {|
  announce: Announce,
|};

export type OnBeforeDragStartHook = (start: DragStart) => mixed;
export type OnDragStartHook = (
  start: DragStart,
  provided: HookProvided,
) => mixed;
export type OnDragUpdateHook = (
  update: DragUpdate,
  provided: HookProvided,
) => mixed;
export type OnDragEndHook = (
  result: DropResult,
  provided: HookProvided,
) => mixed;

export type Hooks = {|
  onBeforeDragStart?: OnBeforeDragStartHook,
  onDragStart?: OnDragStartHook,
  onDragUpdate?: OnDragUpdateHook,
  // always required
  onDragEnd: OnDragEndHook,
|};
