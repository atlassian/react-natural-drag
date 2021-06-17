// @flow
import type { BoxModel, Rect, Position } from 'css-box-model';

export type Id = string;
export type DraggableId = Id;
export type DroppableId = Id;
export type TypeId = Id;
export type ContextId = Id;
export type ElementId = Id;

export type DroppableMode = 'standard' | 'virtual';
export type DroppableDescriptor = {|
  id: DroppableId,
  type: TypeId,
  mode: DroppableMode,
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

export type DraggableOptions = {|
  canDragInteractiveElements: boolean,
  shouldRespectForcePress: boolean,
  timeForLongPress: number,
  isEnabled: boolean,
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

export type PlaceholderInSubject = {|
  // might not actually be increased by
  // placeholder if there is no required space
  increasedBy: ?Position,
  placeholderSize: Position,
  // max scroll before placeholder added
  // will be null if there was no frame
  oldFrameMaxScroll: ?Position,
|};

export type DroppableSubject = {|
  // raw, unchanging
  page: BoxModel,
  withPlaceholder: ?PlaceholderInSubject,
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
  isCombineEnabled: boolean,
  // relative to the current viewport
  client: BoxModel,
  // relative to the whole page
  isFixedOnPage: boolean,
  // relative to the page
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

export type DraggableIdMap = {
  [id: DraggableId]: true,
};

export type DroppableIdMap = {
  [id: DroppableId]: true,
};

export type DraggableDimensionMap = { [key: DraggableId]: DraggableDimension };
export type DroppableDimensionMap = { [key: DroppableId]: DroppableDimension };

export type Displacement = {|
  draggableId: DraggableId,
  shouldAnimate: boolean,
|};

export type DisplacementMap = { [key: DraggableId]: Displacement };

export type DisplacedBy = {|
  value: number,
  point: Position,
|};

export type Combine = {|
  draggableId: DraggableId,
  droppableId: DroppableId,
|};
export type DisplacementGroups = {|
  all: DraggableId[],
  visible: DisplacementMap,
  invisible: DraggableIdMap,
|};

export type ReorderImpact = {|
  type: 'REORDER',
  destination: DraggableLocation,
|};

export type CombineImpact = {|
  type: 'COMBINE',
  combine: Combine,
|};

export type ImpactLocation = ReorderImpact | CombineImpact;

export type Displaced = {|
  forwards: DisplacementGroups,
  backwards: DisplacementGroups,
|};

export type DragImpact = {|
  displaced: DisplacementGroups,
  displacedBy: DisplacedBy,
  at: ?ImpactLocation,
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
  // how much the page position has changed from the initial
  offset: Position,
|};

// There are two seperate modes that a drag can be in
// FLUID: everything is done in response to highly granular input (eg mouse)
// SNAP: items move in response to commands (eg keyboard);
export type MovementMode = 'FLUID' | 'SNAP';

export type DragPositions = {|
  client: ClientPositions,
  page: PagePositions,
|};

export type DraggableRubric = {|
  draggableId: DraggableId,
  type: TypeId,
  source: DraggableLocation,
|};

// Published in onBeforeCapture
// We cannot give more information as things might change in the
// onBeforeCapture responder!
export type BeforeCapture = {|
  draggableId: DraggableId,
  mode: MovementMode,
|};

// published when a drag starts
export type DragStart = {|
  ...DraggableRubric,
  mode: MovementMode,
|};

export type DragUpdate = {|
  ...DragStart,
  // may not have any destination (drag to nowhere)
  destination: ?DraggableLocation,
  // populated when a draggable is dragging over another in combine mode
  combine: ?Combine,
|};

export type DropReason = 'DROP' | 'CANCEL';

// published when a drag finishes
export type DropResult = {|
  ...DragUpdate,
  reason: DropReason,
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

export type LiftEffect = {|
  inVirtualList: boolean,
  effected: DraggableIdMap,
  displacedBy: DisplacedBy,
|};

export type DimensionMap = {|
  draggables: DraggableDimensionMap,
  droppables: DroppableDimensionMap,
|};

export type DroppablePublish = {|
  droppableId: DroppableId,
  scroll: Position,
|};
export type Published = {|
  additions: DraggableDimension[],
  removals: DraggableId[],
  modified: DroppablePublish[],
|};

export type CompletedDrag = {|
  critical: Critical,
  result: DropResult,
  impact: DragImpact,
  afterCritical: LiftEffect,
|};

export type IdleState = {|
  phase: 'IDLE',
  completed: ?CompletedDrag,
  shouldFlush: boolean,
|};

export type DraggingState = {|
  phase: 'DRAGGING',
  isDragging: true,
  critical: Critical,
  movementMode: MovementMode,
  dimensions: DimensionMap,
  initial: DragPositions,
  current: DragPositions,
  impact: DragImpact,
  viewport: Viewport,
  afterCritical: LiftEffect,
  onLiftImpact: DragImpact,
  // when there is a fixed list we want to opt out of this behaviour
  isWindowScrollAllowed: boolean,
  // if we need to jump the scroll (keyboard dragging)
  scrollJumpRequest: ?Position,
  // whether or not draggable movements should be animated
  forceShouldAnimate: ?boolean,
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
  completed: CompletedDrag,
  newHomeClientOffset: Position,
  dropDuration: number,
  // We still need to render placeholders and fix the dimensions of the dragging item
  dimensions: DimensionMap,
|};

export type State =
  | IdleState
  | DraggingState
  | CollectingState
  | DropPendingState
  | DropAnimatingState;

export type StateWhenUpdatesAllowed = DraggingState | CollectingState;

export type Announce = (message: string) => void;

export type InOutAnimationMode = 'none' | 'open' | 'close';

export type ResponderProvided = {|
  announce: Announce,
|};

export type OnBeforeCaptureResponder = (before: BeforeCapture) => mixed;
export type OnBeforeDragStartResponder = (start: DragStart) => mixed;
export type OnDragStartResponder = (
  start: DragStart,
  provided: ResponderProvided,
) => mixed;
export type OnDragUpdateResponder = (
  update: DragUpdate,
  provided: ResponderProvided,
) => mixed;
export type OnDragEndResponder = (
  result: DropResult,
  provided: ResponderProvided,
) => mixed;

export type Responders = {|
  onBeforeCapture?: OnBeforeCaptureResponder,
  onBeforeDragStart?: OnBeforeDragStartResponder,
  onDragStart?: OnDragStartResponder,
  onDragUpdate?: OnDragUpdateResponder,
  // always required
  onDragEnd: OnDragEndResponder,
|};

// ## Sensors
export type StopDragOptions = {|
  shouldBlockNextClick: boolean,
|};

type DragActions = {|
  drop: (args?: StopDragOptions) => void,
  cancel: (args?: StopDragOptions) => void,
  isActive: () => boolean,
  shouldRespectForcePress: () => boolean,
  timeForLongPress: () => number,
|};

export type FluidDragActions = {|
  ...DragActions,
  move: (clientSelection: Position) => void,
|};

export type SnapDragActions = {|
  ...DragActions,
  moveUp: () => void,
  moveDown: () => void,
  moveRight: () => void,
  moveLeft: () => void,
|};

export type PreDragActions = {|
  // discover if the lock is still active
  isActive: () => boolean,
  // whether it has been indicated if force press should be respected
  shouldRespectForcePress: () => boolean,
  timeForLongPress: () => number,
  // lift the current item
  fluidLift: (clientSelection: Position) => FluidDragActions,
  snapLift: () => SnapDragActions,
  // cancel the pre drag without starting a drag. Releases the lock
  abort: () => void,
|};

export type TryGetLockOptions = {
  sourceEvent?: Event,
};

export type TryGetLock = (
  draggableId: DraggableId,
  forceStop?: () => void,
  options?: TryGetLockOptions,
) => ?PreDragActions;

export type SensorAPI = {|
  tryGetLock: TryGetLock,
  canGetLock: (id: DraggableId) => boolean,
  isLockClaimed: () => boolean,
  tryReleaseLock: () => void,
  findClosestDraggableId: (event: Event) => ?DraggableId,
  findOptionsForDraggable: (id: DraggableId) => ?DraggableOptions,
|};

export type Sensor = (api: SensorAPI) => void;
