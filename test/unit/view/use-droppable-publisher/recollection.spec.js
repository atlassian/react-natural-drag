// @flow
import type { Position } from 'css-box-model';
import { mount } from 'enzyme';
import * as React from 'react';
import { invariant } from '../../../../src/invariant';
import type { DimensionMarshal } from '../../../../src/state/dimension-marshal/dimension-marshal-types';
import type { DroppableDimension } from '../../../../src/types';
import { getDroppableDimension } from '../../../util/dimension';
import { getMarshalStub } from '../../../util/dimension-marshal';
import tryCleanPrototypeStubs from '../../../util/try-clean-prototype-stubs';
import { setViewport } from '../../../util/viewport';
import {
  App,
  bigClient,
  border,
  descriptor,
  immediate,
  margin,
  padding,
  preset,
  smallFrameClient,
  WithAppContext,
} from './util/shared';
import type {
  Registry,
  DroppableCallbacks,
} from '../../../../src/state/registry/registry-types';
import createRegistry from '../../../../src/state/registry/create-registry';

beforeEach(() => {
  setViewport(preset.viewport);
});

afterEach(() => {
  tryCleanPrototypeStubs();
});

const expected: DroppableDimension = getDroppableDimension({
  descriptor,
  // as expected
  borderBox: bigClient.borderBox,
  margin,
  padding,
  border,
  windowScroll: preset.windowScroll,
  closest: {
    // we are using the smallFrameClient as a stand in for the elements
    // actual borderBox which is cut off when it is a scroll container
    borderBox: smallFrameClient.borderBox,
    margin,
    padding,
    border,
    // scroll width and height are based on the padding box
    scrollSize: {
      scrollWidth: bigClient.paddingBox.width,
      scrollHeight: bigClient.paddingBox.height,
    },
    scroll: { x: 0, y: 0 },
    shouldClipSubject: true,
  },
});

it('should recollect scroll if requested', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  // both the droppable and the parent are scrollable
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const wrapper = mount(
    <WithAppContext marshal={marshal} registry={registry}>
      <App droppableIsScrollable />
    </WithAppContext>,
  );
  const el: ?HTMLElement = wrapper.find('.droppable').getDOMNode();
  invariant(el);
  // returning smaller border box as this is what occurs when the element is scrollable
  jest
    .spyOn(el, 'getBoundingClientRect')
    .mockImplementation(() => smallFrameClient.borderBox);
  // scrollWidth / scrollHeight are based on the paddingBox of an element
  Object.defineProperty(el, 'scrollWidth', {
    value: bigClient.paddingBox.width,
  });
  Object.defineProperty(el, 'scrollHeight', {
    value: bigClient.paddingBox.height,
  });

  // pull the get dimension function out
  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;
  // execute it to get the dimension
  const initial: DroppableDimension = callbacks.getDimensionAndWatchScroll(
    preset.windowScroll,
    immediate,
  );

  expect(initial).toEqual(expected);

  // ensuring that we have the updated scroll
  const newScroll: Position = { x: 100, y: 200 };
  callbacks.scroll(newScroll);
  const result: Position = callbacks.getScrollWhileDragging();
  expect(result).toEqual(newScroll);
});

it('should throw if there is no drag occurring when a recollection is requested', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  // both the droppable and the parent are scrollable
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  mount(
    <WithAppContext marshal={marshal} registry={registry}>
      <App droppableIsScrollable showPlaceholder />
    </WithAppContext>,
  );

  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;

  expect(() => callbacks.getScrollWhileDragging()).toThrow();
});

it('should throw if there if recollecting from droppable that is not a scroll container', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  // both the droppable and the parent are scrollable
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  mount(
    <WithAppContext marshal={marshal} registry={registry}>
      <App />
    </WithAppContext>,
  );

  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;

  callbacks.getDimensionAndWatchScroll(preset.windowScroll, immediate);

  expect(() => callbacks.getScrollWhileDragging()).toThrow();
});
