// @flow
import { getPreset } from '../../utils/dimension';
import createDimensionMarshal from '../../../src/state/dimension-marshal/dimension-marshal';
import { getDraggableDimension, getDroppableDimension } from '../../../src/state/dimension';
import getClientRect from '../../../src/state/get-client-rect';
import type {
  Callbacks,
  DimensionMarshal,
  DroppableCallbacks,
  GetDraggableDimensionFn,
} from '../../../src/state/dimension-marshal/dimension-marshal-types';
import type {
  DraggableDescriptor,
  DraggableDimension,
  DroppableDimension,
  DraggableDimensionMap,
  DroppableDimensionMap,
  DraggableId,
  DroppableId,
  State,
  ClientRect,
  Phase,
} from '../../../src/types';

const getCallbackStub = (): Callbacks => {
  const callbacks: Callbacks = {
    cancel: jest.fn(),
    publishDraggables: jest.fn(),
    publishDroppables: jest.fn(),
    updateDroppableScroll: jest.fn(),
  };
  return callbacks;
};

type PopulateMarshalState = {|
  draggables: DraggableDimensionMap,
  droppables: DroppableDimensionMap,
|}

const preset = getPreset();

const defaultArgs: PopulateMarshalState = {
  draggables: preset.draggables,
  droppables: preset.droppables,
};

type PopulateMarshalWatches = {
  draggable: {|
    getDimension: Function,
  |},
  droppable: {|
    watchScroll: Function,
    unwatchScroll: Function,
    getDimension: Function,
  |},
}

const populateMarshal = (
  marshal: DimensionMarshal,
  args?: PopulateMarshalState = defaultArgs
): PopulateMarshalWatches => {
  const { draggables, droppables } = args;
  const watches: PopulateMarshalWatches = {
    draggable: {
      getDimension: jest.fn(),
    },
    droppable: {
      watchScroll: jest.fn(),
      unwatchScroll: jest.fn(),
      getDimension: jest.fn(),
    },
  };

  Object.keys(droppables).forEach((id: DroppableId) => {
    const droppable: DroppableDimension = droppables[id];
    const callbacks: DroppableCallbacks = {
      getDimension: (): DroppableDimension => {
        watches.droppable.getDimension(id);
        return droppable;
      },
      watchScroll: () => {
        watches.droppable.watchScroll(id);
      },
      unwatchScroll: () => {
        watches.droppable.unwatchScroll(id);
      },
    };

    marshal.registerDroppable(droppable.descriptor, callbacks);
  });

  Object.keys(draggables).forEach((id: DraggableId) => {
    const draggable: DraggableDimension = draggables[id];
    const getDimension = (): DraggableDimension => {
      watches.draggable.getDimension(id);
      return draggable;
    };
    marshal.registerDraggable(draggable.descriptor, getDimension);
  });

  return watches;
};

type PhaseMap = { [key: string] : Phase }

const phase: PhaseMap = {
  idle: 'IDLE',
  requesting: 'COLLECTING_INITIAL_DIMENSIONS',
  dropAnimating: 'DROP_ANIMATING',
  dropComplete: 'DROP_COMPLETE',
};

const fakeClientRect: ClientRect = getClientRect({
  top: 0, right: 100, bottom: 100, left: 0,
});

const ofAnotherType: DroppableDimension = getDroppableDimension({
  descriptor: {
    id: 'of-another-type',
    type: 'another-type',
  },
  clientRect: fakeClientRect,
});
const childOfAnotherType: DraggableDimension = getDraggableDimension({
  descriptor: {
    id: 'addition',
    droppableId: ofAnotherType.descriptor.id,
    index: 0,
  },
  clientRect: fakeClientRect,
});

describe('dimension marshal', () => {
  beforeAll(() => {
    requestAnimationFrame.reset();
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    requestAnimationFrame.reset();
    jest.useRealTimers();
    console.error.mockRestore();
  });

  const executeCollectionPhase = () => {
    // lift timeout
    jest.runOnlyPendingTimers();
    // execute first frame - this should publish everything
    requestAnimationFrame.step();
  };

  const executePublishPhase = () => {
    // after the first frame, the second frame is just a single frame away
    requestAnimationFrame.step();
  };

  const executeCollectionAndPublish = () => {
    executeCollectionPhase();
    executePublishPhase();
  };

  describe('drag starting (including early cancel)', () => {
    describe('invalid start state', () => {
      it('should cancel the collecting if already collecting', () => {

      });

      it('should cancel the collection if the draggable cannot be found', () => {

      });

      it('should cancel the collection if the home droppable cannot be found', () => {

      });
    });

    describe('pre drag start actions', () => {
      it('should publish the home droppable and dragging item', () => {
        const callbacks = getCallbackStub();
        const marshal = createDimensionMarshal(callbacks);
        populateMarshal(marshal);

        marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

        expect(callbacks.publishDraggables).toHaveBeenCalledTimes(1);
        expect(callbacks.publishDraggables).toBeCalledWith([preset.inHome1]);
        expect(callbacks.publishDroppables).toHaveBeenCalledTimes(1);
        expect(callbacks.publishDroppables).toBeCalledWith([preset.home]);
      });

      it('should ask the home droppable to start listening to scrolling', () => {
        const callbacks = getCallbackStub();
        const marshal = createDimensionMarshal(callbacks);
        const watches = populateMarshal(marshal);

        marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

        // it should not watch scroll on the other droppables at this stage
        expect(watches.droppable.watchScroll).toHaveBeenCalledTimes(1);
        expect(watches.droppable.watchScroll).toHaveBeenCalledWith(preset.home.descriptor.id);
      });
    });

    describe('post drag start actions', () => {
      describe('before the first frame', () => {
        it('should not do anything if the drag was cancelled before the lift timeout finished', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          expect(callbacks.publishDroppables).toHaveBeenCalledTimes(1);
          expect(callbacks.publishDraggables).toHaveBeenCalledTimes(1);
          // moving to idle state
          marshal.onStateChange(phase.idle);
          // something would normally happen
          jest.runAllTimers();
          requestAnimationFrame.flush();

          // nothing happened
          expect(callbacks.publishDroppables).toHaveBeenCalledTimes(1);
          expect(callbacks.publishDraggables).toHaveBeenCalledTimes(1);
        });
      });

      describe('in the first frame', () => {
        it('should not do anything if the drag was cancelled before the frame executed', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          expect(callbacks.publishDroppables).toHaveBeenCalledTimes(1);
          expect(callbacks.publishDraggables).toHaveBeenCalledTimes(1);
          callbacks.publishDroppables.mockClear();
          callbacks.publishDraggables.mockClear();

          // now fast forwarding lift timeout
          jest.runOnlyPendingTimers();
          // no animation frame has occurred yet
          // moving to idle state
          marshal.onStateChange(phase.idle);
          // flushing all frames
          requestAnimationFrame.flush();

          expect(callbacks.publishDraggables).not.toHaveBeenCalled();
        });

        it('should collect all of the dimensions', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          expect(watchers.draggable.getDimension).toHaveBeenCalledTimes(1);
          expect(watchers.droppable.getDimension).toHaveBeenCalledTimes(1);
          watchers.draggable.getDimension.mockClear();
          watchers.droppable.getDimension.mockClear();

          executeCollectionPhase();

          // all dimensions have been collected
          // length -1 as the initial dimensions have already been collected
          expect(watchers.draggable.getDimension)
            .toHaveBeenCalledTimes(Object.keys(preset.draggables).length - 1);
          expect(watchers.droppable.getDimension)
            .toHaveBeenCalledTimes(Object.keys(preset.droppables).length - 1);
        });

        it('should only collect dimensions have the same type as the dragging item', () => {
          const droppables: DroppableDimensionMap = {
            ...preset.droppables,
            [ofAnotherType.descriptor.id]: ofAnotherType,
          };
          const draggables: DraggableDimensionMap = {
            ...preset.draggables,
            [childOfAnotherType.descriptor.id]: childOfAnotherType,
          };
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal, {
            draggables,
            droppables,
          });

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          // clearing the initial calls
          watchers.draggable.getDimension.mockClear();
          watchers.droppable.getDimension.mockClear();

          executeCollectionPhase();

          expect(watchers.draggable.getDimension)
            .not.toHaveBeenCalledWith(childOfAnotherType.descriptor.id);
          expect(watchers.droppable.getDimension)
            .not.toHaveBeenCalledWith(ofAnotherType.descriptor.id);

          // should not have requested the dimension for the added draggable and droppable
          // - 1 for the original values && - 1 for the dimensions of different types
          expect(watchers.draggable.getDimension)
            .toHaveBeenCalledTimes(Object.keys(draggables).length - 2);
          expect(watchers.droppable.getDimension)
            .toHaveBeenCalledTimes(Object.keys(droppables).length - 2);
        });

        it('should not collect the dragging dimension as it has already been collected', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          // called straight away
          expect(watchers.draggable.getDimension)
            .toHaveBeenCalledWith(preset.inHome1.descriptor.id);
          // clear the watchers state
          watchers.draggable.getDimension.mockClear();
          // will trigger the collection
          executeCollectionPhase();

          expect(watchers.draggable.getDimension)
            .not.toHaveBeenCalledWith(preset.inHome1.descriptor.id);
        });

        it('should not collect the home droppable dimension as it has already been collected', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          // called straight away
          expect(watchers.droppable.getDimension)
            .toHaveBeenCalledWith(preset.home.descriptor.id);
          // clear the watchers state
          watchers.droppable.getDimension.mockClear();
          // will trigger the collection
          executeCollectionPhase();

          expect(watchers.droppable.getDimension)
            .not.toHaveBeenCalledWith(preset.home.descriptor.id);
        });
      });

      describe('in the second frame', () => {
        it('should not do anything if the drag was cancelled before the frame executed', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          // clearing initial calls
          callbacks.publishDraggables.mockClear();
          callbacks.publishDroppables.mockClear();
          executeCollectionPhase();
          // cancelled before second frame fired
          marshal.onStateChange(phase.idle);
          executePublishPhase();

          // nothing additional called
          expect(callbacks.publishDraggables).not.toHaveBeenCalled();
          expect(callbacks.publishDroppables).not.toHaveBeenCalled();
        });

        it('should publish all the collected draggables', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          // clearing initial calls
          callbacks.publishDraggables.mockClear();

          executeCollectionAndPublish();

          // calls are batched
          expect(callbacks.publishDraggables).toHaveBeenCalledTimes(1);
          const result: DraggableDimension[] = callbacks.publishDraggables.mock.calls[0][0];
          // not calling for the dragging item
          expect(result.length).toBe(Object.keys(preset.draggables).length - 1);
          // super explicit test
          // - doing it like this because the order of Object.keys is not guarenteed
          Object.keys(preset.draggables).forEach((id: DraggableId) => {
            if (id === preset.inHome1.descriptor.id) {
              expect(result).not.toContain(preset.inHome1);
              return;
            }
            expect(result).toContain(preset.draggables[id]);
          });
        });

        it('should publish all the collected droppables', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          // clearing initial calls
          callbacks.publishDroppables.mockClear();

          executeCollectionAndPublish();

          // calls are batched
          expect(callbacks.publishDroppables).toHaveBeenCalledTimes(1);
          const result: DroppableDimension[] = callbacks.publishDroppables.mock.calls[0][0];
          // not calling for the dragging item
          expect(result.length).toBe(Object.keys(preset.droppables).length - 1);
          // super explicit test
          // - doing it like this because the order of Object.keys is not guarenteed
          Object.keys(preset.droppables).forEach((id: DroppableId) => {
            if (id === preset.home.descriptor.id) {
              expect(result.includes(preset.home)).toBe(false);
              return;
            }
            expect(result.includes(preset.droppables[id])).toBe(true);
          });
        });

        it('should request all the droppables to start listening to scroll events', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal);

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          // initial droppable
          expect(watchers.droppable.watchScroll).toHaveBeenCalledTimes(1);
          // clearing this initial call
          watchers.droppable.watchScroll.mockClear();

          executeCollectionAndPublish();

          // excluding the home droppable
          const expectedLength: number = Object.keys(preset.droppables).length - 1;
          expect(watchers.droppable.watchScroll).toHaveBeenCalledTimes(expectedLength);
        });

        it('should not publish dimensions that where not collected', () => {
          const droppables: DroppableDimensionMap = {
            ...preset.droppables,
            [ofAnotherType.descriptor.id]: ofAnotherType,
          };
          const draggables: DraggableDimensionMap = {
            ...preset.draggables,
            [childOfAnotherType.descriptor.id]: childOfAnotherType,
          };
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal, {
            draggables,
            droppables,
          });

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          executeCollectionAndPublish();

          expect(callbacks.publishDroppables.mock.calls[0][0]).not.toContain(ofAnotherType);
          expect(callbacks.publishDraggables.mock.calls[0][0]).not.toContain(childOfAnotherType);
        });
      });
    });
  });

  describe('drag completed after initial collection', () => {
    it('should unwatch all the scroll events on droppables', () => {
      [phase.idle].forEach((finish: State) => {
        const marshal = createDimensionMarshal(getCallbackStub());
        const watchers = populateMarshal(marshal);

        // do initial work
        marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
        executeCollectionAndPublish();
        // currently only watching
        Object.keys(preset.droppables).forEach((id: DroppableId) => {
          expect(watchers.droppable.watchScroll).toHaveBeenCalledWith(id);
          expect(watchers.droppable.unwatchScroll).not.toHaveBeenCalledWith(id);
        });

        // finishing the drag
        marshal.onStateChange(finish);
        // now unwatch has been called
        Object.keys(preset.droppables).forEach((id: DroppableId) => {
          expect(watchers.droppable.unwatchScroll).toHaveBeenCalledWith(id);
        });
      });
    });
  });

  describe('subsequent drags', () => {

  });

  describe('registration change while not collecting', () => {
    const droppableCallbacks: DroppableCallbacks = {
      getDimension: () => preset.home,
      watchScroll: () => { },
      unwatchScroll: () => { },
    };
    const getDraggableDimensionFn: GetDraggableDimensionFn = () => preset.inHome1;

    describe('dimension added', () => {
      describe('droppable', () => {
        it('should log an error if there is already an entry with the same id', () => {
          const marshal = createDimensionMarshal(getCallbackStub());

          marshal.registerDroppable(preset.home.descriptor, droppableCallbacks);
          expect(console.error).not.toHaveBeenCalled();

          marshal.registerDroppable(preset.home.descriptor, droppableCallbacks);
          expect(console.error).toHaveBeenCalled();
        });

        it('should be published in the next collection', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal, {
            draggables: {}, droppables: {},
          });

          marshal.registerDroppable(preset.home.descriptor, droppableCallbacks);
          marshal.registerDraggable(preset.inHome1.descriptor, getDraggableDimensionFn);
          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          expect(callbacks.publishDroppables).toHaveBeenCalledWith([preset.home]);
        });
      });

      describe('draggable', () => {
        it('should log an error if there is no matching droppable', () => {
          const marshal = createDimensionMarshal(getCallbackStub());

          marshal.registerDraggable(preset.inHome1.descriptor, getDraggableDimensionFn);
          expect(console.error).toHaveBeenCalled();
        });

        it('should log an error if there is already an entry with the same id', () => {
          const marshal = createDimensionMarshal(getCallbackStub());

          // need to register a droppable first
          marshal.registerDroppable(preset.home.descriptor, droppableCallbacks);

          marshal.registerDraggable(preset.inHome1.descriptor, getDraggableDimensionFn);
          expect(console.error).not.toHaveBeenCalled();

          marshal.registerDraggable(preset.inHome1.descriptor, getDraggableDimensionFn);
          expect(console.error).toHaveBeenCalled();
        });

        it('should be published in the next collection', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal, {
            draggables: {}, droppables: {},
          });

          marshal.registerDroppable(preset.home.descriptor, droppableCallbacks);
          marshal.registerDraggable(preset.inHome1.descriptor, getDraggableDimensionFn);
          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          expect(callbacks.publishDraggables).toHaveBeenCalledWith([preset.inHome1]);
        });
      });
    });

    describe('dimension removed', () => {
      describe('droppable', () => {
        it('should log an error if there is no entry with a matching id', () => {
          const marshal = createDimensionMarshal(getCallbackStub());

          marshal.unregisterDroppable(preset.inHome1.descriptor.id);

          expect(console.error).toHaveBeenCalled();
        });

        it('should not error if the droppable still has registered draggables', () => {
          // Even though this leaves orphans, the in react the parent is unmounted before the child
          // removing foreign droppable
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);

          // unregistering the foreign droppable without unregistering its children
          marshal.unregisterDroppable(preset.foreign.descriptor.id);
          expect(console.error).not.toHaveBeenCalled();
        });

        it('should remove the dimension if it exists', () => {
          // removing foreign droppable
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal);

          // unregistering the foreign droppable
          marshal.unregisterDroppable(preset.foreign.descriptor.id);
          // unregistering all children to prevent orphan children log
          preset.inForeignList.forEach((dimension: DraggableDimension) => {
            marshal.unregisterDraggable(dimension.descriptor.id);
          });
          expect(console.error).not.toHaveBeenCalled();

          // lift, collect and publish
          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          // clearing state from original publish
          callbacks.publishDroppables.mockClear();
          executeCollectionAndPublish();

          expect(watchers.droppable.getDimension)
            .not.toHaveBeenCalledWith(preset.foreign.descriptor.id);
          expect(callbacks.publishDroppables.mock.calls[0][0])
            .not.toContain(preset.foreign);

          // checking we are not causing an orphan child warning
          expect(console.error).not.toHaveBeenCalled();
        });

        // This should never happen - this test is just checking that the error logging is occurring
        it('should exclude orphaned children on the next collection', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          const watchers = populateMarshal(marshal);

          // unregistering the foreign droppable
          marshal.unregisterDroppable(preset.foreign.descriptor.id);
          expect(console.error).not.toHaveBeenCalled();
          // not unregistering children (bad)

          // lift, collect and publish
          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          executeCollectionAndPublish();

          // checking that none of the children in the foreign list where interacted with
          preset.inForeignList.forEach((dimension: DraggableDimension) => {
            expect(watchers.draggable.getDimension)
              .not.toHaveBeenCalledWith(dimension.descriptor.id);
          });

          // this should cause an orphan child warning
          expect(console.error).toHaveBeenCalledTimes(preset.inForeignList.length);
        });
      });

      describe('draggable', () => {
        it('should log an error if there is no entry with a matching id', () => {
          const marshal = createDimensionMarshal(getCallbackStub());

          marshal.unregisterDraggable(preset.home.descriptor.id);

          expect(console.error).toHaveBeenCalled();
        });

        it('should remove the dimension if it exists', () => {
          const marshal = createDimensionMarshal(getCallbackStub());
          const watchers = populateMarshal(marshal);

          marshal.unregisterDraggable(preset.inForeign1.descriptor.id);
          expect(console.error).not.toHaveBeenCalled();

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);
          executeCollectionAndPublish();

          expect(watchers.draggable.getDimension)
            .not.toHaveBeenCalledWith(preset.inForeign1.descriptor.id);
        });
      });
    });
  });

  describe('registration change while collecting', () => {
    describe('dimension added', () => {
      describe('draggable', () => {
        it('should immediately publish the draggable', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);
          const fake: DraggableDimension = getDraggableDimension({
            descriptor: {
              id: 'my fake id',
              droppableId: preset.home.descriptor.id,
              index: preset.inHomeList.length,
            },
            clientRect: fakeClientRect,
          });

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          marshal.registerDraggable(fake.descriptor, () => fake);
          expect(callbacks.publishDraggables).toHaveBeenCalledWith([fake]);
        });
      });

      describe('droppable', () => {
        it('should immediately publish the droppable', () => {
          const callbacks = getCallbackStub();
          const marshal = createDimensionMarshal(callbacks);
          populateMarshal(marshal);
          const fake: DroppableDimension = getDroppableDimension({
            descriptor: {
              id: 'my fake id',
              type: preset.home.descriptor.type,
            },
            clientRect: fakeClientRect,
          });
          const droppableCallbacks: DroppableCallbacks = {
            getDimension: () => fake,
            watchScroll: jest.fn(),
            unwatchScroll: () => { },
          };

          marshal.onStateChange(phase.requesting, preset.inHome1.descriptor);

          marshal.registerDroppable(fake.descriptor, droppableCallbacks);
          expect(callbacks.publishDroppables).toHaveBeenCalledWith([fake]);
          // should subscribe to scrolling immediately
          expect(droppableCallbacks.watchScroll).toHaveBeenCalled();
        });
      });
    });
  });
});
